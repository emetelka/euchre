import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useGameLoop, useAITurn } from '../../hooks/useGameLoop';
import { PlayerHand } from './PlayerHand';
import { PlayArea } from './PlayArea';
import { ScoreBoard } from '../ui/ScoreBoard';
import { BidDialog } from '../ui/BidDialog';
import { SettingsDialog } from '../ui/SettingsDialog';
import { TrumpNotice } from '../ui/TrumpNotice';
import { DiscardDialog } from '../ui/DiscardDialog';
import { GoAloneDialog } from '../ui/GoAloneDialog';
import { getValidCards } from '../../engine/gameRules';
import { getAvailableSuitsForPicking } from '../../engine/bidding';
import type { Card as CardType, Suit } from '../../engine/types';

// Import AI strategies
import { shouldOrderUpEasy, pickSuitEasy, selectCardEasy } from '../../ai/strategies/easy';
import { shouldOrderUpMedium, pickSuitMedium, selectCardMedium } from '../../ai/strategies/medium';
import { shouldOrderUpHard, pickSuitHard, selectCardHard } from '../../ai/strategies/hard';

export const GameBoard: React.FC = () => {
  const { game } = useGameLoop();
  const { executeAIBid, executeAIPlay, isAITurn } = useAITurn();
  const playCard = useGameStore((state) => state.playCard);
  const processBid = useGameStore((state) => state.processBid);
  const discardCard = useGameStore((state) => state.discardCard);
  const advancePhase = useGameStore((state) => state.advancePhase);
  const startNewGame = useGameStore((state) => state.startNewGame);
  const resetGame = useGameStore((state) => state.resetGame);
  const settings = useSettingsStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Start new game on mount if no game exists
  useEffect(() => {
    if (!game) {
      startNewGame(settings.playerNames, settings.playerAvatars, settings.difficulty);
    }
  }, []);

  // Handle AI turns
  useEffect(() => {
    if (!game || !isAITurn) return;

    const currentPlayer = game.players[game.currentPlayer];
    const difficulty = currentPlayer.difficulty;

    if (!difficulty) return;

    // Skip if this player is the partner sitting out during go alone
    if (game.hand && game.hand.goingAlone && game.hand.alonePlayer !== null) {
      const partnerPosition = (game.hand.alonePlayer + 2) % 4;
      if (currentPlayer.position === partnerPosition) {
        return;
      }
    }

    // AI bidding
    if (game.phase === 'BIDDING_ROUND_1' && game.bidding) {
      const shouldOrder =
        difficulty === 'easy'
          ? shouldOrderUpEasy(
              currentPlayer.hand,
              game.bidding.turnedUpCard!,
              currentPlayer.position,
              game.bidding.dealer
            )
          : difficulty === 'hard'
          ? shouldOrderUpHard(
              currentPlayer.hand,
              game.bidding.turnedUpCard!,
              currentPlayer.position,
              game.bidding.dealer
            )
          : shouldOrderUpMedium(
              currentPlayer.hand,
              game.bidding.turnedUpCard!,
              currentPlayer.position,
              game.bidding.dealer
            );

      if (shouldOrder) {
        executeAIBid({ type: 'order_up' });
      } else {
        executeAIBid({ type: 'pass' });
      }
    } else if (game.phase === 'BIDDING_ROUND_2' && game.bidding) {
      const pickedSuit =
        difficulty === 'easy'
          ? pickSuitEasy(currentPlayer.hand, game.bidding, currentPlayer.position)
          : difficulty === 'hard'
          ? pickSuitHard(currentPlayer.hand, game.bidding, currentPlayer.position)
          : pickSuitMedium(currentPlayer.hand, game.bidding, currentPlayer.position);

      if (pickedSuit) {
        executeAIBid({ type: 'pick_suit', suit: pickedSuit });
      } else {
        executeAIBid({ type: 'pass' });
      }
    }
    // AI go alone decision
    else if (game.phase === 'GO_ALONE_DECISION' && game.hand && game.hand.trump) {
      // Simple AI logic: go alone with 4+ trump cards including at least one bower
      const trump = game.hand.trump;
      const trumpCards = currentPlayer.hand.filter((card) => {
        // Right bower
        if (card.suit === trump && card.rank === 'J') return true;
        // Left bower (Jack of same color)
        const colorPairs: Record<string, string> = {
          hearts: 'diamonds',
          diamonds: 'hearts',
          clubs: 'spades',
          spades: 'clubs',
        };
        if (card.suit === colorPairs[trump] && card.rank === 'J') return true;
        // Regular trump
        return card.suit === trump;
      });

      const hasBower = trumpCards.some((card) => card.rank === 'J');
      const shouldGoAlone = trumpCards.length >= 4 && hasBower;

      setTimeout(() => {
        if (shouldGoAlone) {
          processBid({ type: 'go_alone' });
        }
        advancePhase();
      }, 1000);
    }
    // AI card play
    else if (game.phase === 'PLAYING' && game.hand) {
      let card: CardType;

      if (difficulty === 'easy') {
        card = selectCardEasy(currentPlayer.hand, game.hand.currentTrick.cardsPlayed, game.hand.trump!);
      } else if (difficulty === 'hard') {
        // Collect all played cards for card counting
        const allPlayedCards: CardType[] = [];
        game.hand.tricks.forEach((trick) => {
          trick.cardsPlayed.forEach((play) => allPlayedCards.push(play.card));
        });
        game.hand.currentTrick.cardsPlayed.forEach((play) => allPlayedCards.push(play.card));

        card = selectCardHard(
          currentPlayer.hand,
          game.hand.currentTrick.cardsPlayed,
          game.hand.trump!,
          currentPlayer.position,
          game.hand.makingTeam,
          allPlayedCards
        );
      } else {
        card = selectCardMedium(
          currentPlayer.hand,
          game.hand.currentTrick.cardsPlayed,
          game.hand.trump!,
          currentPlayer.position,
          game.hand.makingTeam
        );
      }

      executeAIPlay(card);
    }
  }, [game?.currentPlayer, game?.phase, isAITurn]);

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const humanPlayer = game.players[0];
  const validCards =
    game.phase === 'PLAYING' && game.hand && !isAITurn
      ? getValidCards(
          humanPlayer.hand,
          game.hand.currentTrick.cardsPlayed.length > 0 ? game.hand.currentTrick.cardsPlayed[0].card : null,
          game.hand.trump!
        )
      : [];

  const handleCardClick = (card: CardType) => {
    if (game.phase === 'PLAYING' && !isAITurn) {
      playCard(card);
    }
  };

  const handleOrderUp = () => {
    processBid({ type: 'order_up' });
  };

  const handlePass = () => {
    processBid({ type: 'pass' });
  };

  const handlePickSuit = (suit: Suit) => {
    processBid({ type: 'pick_suit', suit });
  };

  const handleGoAlone = () => {
    processBid({ type: 'go_alone' });
    // Delay to ensure state updates are applied before advancing
    setTimeout(() => {
      advancePhase();
    }, 100);
  };

  const handleDeclineAlone = () => {
    // Move to TRUMP_SELECTED without going alone
    setTimeout(() => {
      advancePhase();
    }, 100);
  };

  const showBidDialog =
    (game.phase === 'BIDDING_ROUND_1' || game.phase === 'BIDDING_ROUND_2') &&
    game.currentPlayer === 0 &&
    game.bidding;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 gap-3 sm:gap-6">
      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-6xl">
        <div className="text-white text-xl sm:text-2xl font-bold">Euchre</div>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm sm:text-base rounded-lg transition-all"
          >
            Settings
          </button>
          <button
            onClick={() => {
              resetGame();
              startNewGame(settings.playerNames, settings.playerAvatars, settings.difficulty);
            }}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base rounded-lg transition-all"
          >
            New Game
          </button>
        </div>
      </div>

      {/* Main game area */}
      <div className="flex flex-col md:grid md:grid-cols-[200px_1fr_200px] gap-3 md:gap-6 w-full max-w-6xl">
        {/* Left sidebar - Score (top on mobile, left on desktop) */}
        <div className="order-1 md:order-none">
          <ScoreBoard
            score={game.score}
            teamNames={[
              `${game.players[0].name} & ${game.players[2].name}`,
              `${game.players[1].name} & ${game.players[3].name}`,
            ]}
            trump={game.hand?.trump || null}
            makingTeam={game.hand?.makingTeam || null}
          />
        </div>

        {/* Center - Game board */}
        <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 md:gap-8 order-2 md:order-none">
          {/* North player */}
          <div className="flex flex-col items-center gap-1 sm:gap-2">
            <div className="text-white font-medium text-xs sm:text-sm md:text-base">{game.players[2].name}</div>
            <PlayerHand cards={game.players[2].hand} position="north" faceDown />
          </div>

          {/* Center area with West, Play Area, and East */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-8">
            {/* West player */}
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <div className="text-white font-medium text-xs sm:text-sm md:text-base">{game.players[1].name}</div>
              <PlayerHand cards={game.players[1].hand} position="west" faceDown showCountOnly />
            </div>

            {/* Play area */}
            <div>
              {game.hand && (
                <PlayArea
                  cardsPlayed={game.hand.currentTrick.cardsPlayed}
                  trump={game.hand.trump}
                />
              )}
            </div>

            {/* East player */}
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <div className="text-white font-medium text-xs sm:text-sm md:text-base">{game.players[3].name}</div>
              <PlayerHand cards={game.players[3].hand} position="east" faceDown showCountOnly />
            </div>
          </div>

          {/* South player (human) */}
          <div className="flex flex-col items-center gap-1 sm:gap-2">
            <div className="text-white font-medium text-xs sm:text-sm md:text-base">{game.players[0].name}</div>
            <PlayerHand
              cards={humanPlayer.hand}
              position="south"
              onCardClick={handleCardClick}
              validCards={validCards}
            />
          </div>
        </div>

        {/* Right sidebar - Info (bottom on mobile, right on desktop) */}
        <div className="text-white order-3 md:order-none">
          <div className="bg-white bg-opacity-10 rounded-lg p-3 sm:p-4">
            <div className="text-xs sm:text-sm mb-2">
              <div className="font-bold mb-1">Current Player:</div>
              <div>{game.players[game.currentPlayer].name}</div>
            </div>
            {game.hand && game.hand.trump && (
              <div className="text-xs sm:text-sm mb-2">
                <div className="font-bold mb-1">Trump:</div>
                <div className="capitalize">{game.hand.trump}</div>
              </div>
            )}
            <div className="text-xs sm:text-sm">
              <div className="font-bold mb-1">Phase:</div>
              <div className="capitalize">{game.phase.replace(/_/g, ' ')}</div>
            </div>
            {game.hand && (
              <div className="text-xs sm:text-sm mt-2">
                <div className="font-bold mb-1">Tricks Won:</div>
                <div>{game.players[0].name} & {game.players[2].name}: {game.hand.tricksWon[0]}</div>
                <div>{game.players[1].name} & {game.players[3].name}: {game.hand.tricksWon[1]}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bid dialog */}
      {showBidDialog && game.bidding && (
        <BidDialog
          bidding={game.bidding}
          onOrderUp={handleOrderUp}
          onPass={handlePass}
          onPickSuit={handlePickSuit}
          availableSuits={getAvailableSuitsForPicking(game.bidding.turnedUpCard)}
          playerHand={humanPlayer.hand}
          dealerName={game.players[game.bidding.dealer].name}
        />
      )}

      {/* Dealer discard dialog */}
      {game.phase === 'DEALER_DISCARD' && game.hand && game.hand.trump && (
        <DiscardDialog
          hand={humanPlayer.hand}
          trump={game.hand.trump}
          onDiscard={(card) => {
            discardCard(card);
          }}
        />
      )}

      {/* Go alone decision dialog */}
      {game.phase === 'GO_ALONE_DECISION' && game.currentPlayer === 0 && game.hand && game.hand.trump && (
        <GoAloneDialog
          trump={game.hand.trump}
          onGoAlone={handleGoAlone}
          onDecline={handleDeclineAlone}
        />
      )}

      {/* Trump selected notice */}
      {game.phase === 'TRUMP_SELECTED' && game.hand && game.hand.trump && game.hand.maker !== null && game.bidding && (
        <TrumpNotice
          trump={game.hand.trump}
          maker={game.bidding.maker !== null ? game.bidding.maker : game.hand.maker}
          playerNames={[game.players[0].name, game.players[1].name, game.players[2].name, game.players[3].name]}
          goingAlone={game.hand.goingAlone}
          onConfirm={() => {
            advancePhase();
          }}
        />
      )}

      {/* Game over dialog */}
      {game.phase === 'GAME_COMPLETE' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">
              Game Over!
            </h2>
            <p className="text-lg sm:text-xl text-center mb-4 sm:mb-6">
              {game.winningTeam === 0 ? 'You & North Win!' : 'West & East Win!'}
            </p>
            <div className="text-center text-base sm:text-lg mb-4 sm:mb-6">
              Final Score: {game.score[0]} - {game.score[1]}
            </div>
            <button
              onClick={() => {
                resetGame();
                startNewGame(settings.playerNames, settings.playerAvatars, settings.difficulty);
              }}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Settings dialog */}
      <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};
