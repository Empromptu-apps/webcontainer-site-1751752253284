import React, { useState, useEffect } from 'react';

const SpaceBattleship = () => {
  const [gameState, setGameState] = useState('setup');
  const [playerBoard, setPlayerBoard] = useState([]);
  const [aiBoard, setAiBoard] = useState([]);
  const [playerShots, setPlayerShots] = useState([]);
  const [aiShots, setAiShots] = useState([]);
  const [playerShips, setPlayerShips] = useState([]);
  const [aiShips, setAiShips] = useState([]);
  const [currentTurn, setCurrentTurn] = useState('player');
  const [gameLog, setGameLog] = useState([]);
  const [winner, setWinner] = useState(null);

  const ships = [
    { name: 'Dreadnought', size: 5, emoji: '🚀' },
    { name: 'Cruiser', size: 4, emoji: '🛸' },
    { name: 'Frigate', size: 3, emoji: '🚁' },
    { name: 'Stealth Fighter', size: 3, emoji: '✈️' },
    { name: 'Scout Ship', size: 2, emoji: '🛩️' }
  ];

  const aiTaunts = {
    miss: [
      "Your aim is worse than a malfunctioning targeting computer!",
      "Space is big, commander. Try hitting something next time!",
      "Did you close your eyes before firing?",
      "My grandmother could shoot better, and she's been dead for 200 years!",
      "That shot went so wide it's probably in another galaxy!"
    ],
    hit: [
      "Lucky shot, flesh bag!",
      "You got me, but my shields are still holding!",
      "Impossible! My cloaking device must be malfunctioning!",
      "A hit! But you'll never find the rest of my fleet!",
      "Curse your sudden but inevitable betrayal!"
    ],
    sunk: [
      "NOOO! My beautiful ship!",
      "You may have won this battle, but the war isn't over!",
      "That ship cost me 50,000 space credits!",
      "Retreat! Retreat! ...Wait, I can't retreat in this game.",
      "I'll remember this, human!"
    ],
    aiHit: [
      "Direct hit! Your ship is taking damage!",
      "Boom! How do you like my superior AI targeting?",
      "Another one bites the space dust!",
      "My sensors are locked onto your position!",
      "Resistance is futile!"
    ],
    aiMiss: [
      "Blast! My calculations were off!",
      "Curse these inferior targeting systems!",
      "You got lucky that time, human!",
      "My aim is usually better than this...",
      "Strategic miss to lull you into false confidence!"
    ]
  };

  const createEmptyBoard = () => {
    return Array(10).fill().map(() => Array(10).fill(0));
  };

  const isValidPlacement = (board, row, col, size, horizontal) => {
    if (horizontal) {
      if (col + size > 10) return false;
      for (let i = 0; i < size; i++) {
        if (board[row][col + i] !== 0) return false;
      }
    } else {
      if (row + size > 10) return false;
      for (let i = 0; i < size; i++) {
        if (board[row + i][col] !== 0) return false;
      }
    }
    return true;
  };

  const placeShip = (board, row, col, size, horizontal, shipId) => {
    const newBoard = board.map(row => [...row]);
    const positions = [];
    
    if (horizontal) {
      for (let i = 0; i < size; i++) {
        newBoard[row][col + i] = shipId;
        positions.push([row, col + i]);
      }
    } else {
      for (let i = 0; i < size; i++) {
        newBoard[row + i][col] = shipId;
        positions.push([row + i, col]);
      }
    }
    
    return { board: newBoard, positions };
  };

  const placeShipsRandomly = () => {
    let board = createEmptyBoard();
    let shipPositions = [];
    
    ships.forEach((ship, index) => {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 100) {
        const row = Math.floor(Math.random() * 10);
        const col = Math.floor(Math.random() * 10);
        const horizontal = Math.random() < 0.5;
        
        if (isValidPlacement(board, row, col, ship.size, horizontal)) {
          const result = placeShip(board, row, col, ship.size, horizontal, index + 1);
          board = result.board;
          shipPositions.push({
            ...ship,
            id: index + 1,
            positions: result.positions,
            hits: 0
          });
          placed = true;
        }
        attempts++;
      }
    });
    
    return { board, ships: shipPositions };
  };

  const initializeGame = () => {
    const playerSetup = placeShipsRandomly();
    const aiSetup = placeShipsRandomly();
    
    setPlayerBoard(playerSetup.board);
    setAiBoard(aiSetup.board);
    setPlayerShips(playerSetup.ships);
    setAiShips(aiSetup.ships);
    setPlayerShots([]);
    setAiShots([]);
    setGameLog(['🚀 Welcome to Space Battleship! Your fleet has been deployed randomly.', '🤖 AI: "Prepare to be obliterated, human!"']);
    setGameState('playing');
    setCurrentTurn('player');
    setWinner(null);
  };

  const handlePlayerShot = (row, col) => {
    if (gameState !== 'playing' || currentTurn !== 'player') return;
    
    if (playerShots.some(shot => shot.row === row && shot.col === col)) return;
    
    const hit = aiBoard[row][col] !== 0;
    const newShot = { row, col, hit };
    const newPlayerShots = [...playerShots, newShot];
    setPlayerShots(newPlayerShots);
    
    let newGameLog = [...gameLog];
    
    if (hit) {
      const shipId = aiBoard[row][col];
      const hitShip = aiShips.find(ship => ship.id === shipId);
      hitShip.hits++;
      
      if (hitShip.hits === hitShip.size) {
        newGameLog.push(`💥 You sunk the AI's ${hitShip.name}!`);
        newGameLog.push(`🤖 AI: "${aiTaunts.sunk[Math.floor(Math.random() * aiTaunts.sunk.length)]}"`);
        
        if (aiShips.every(ship => ship.hits === ship.size)) {
          setWinner('player');
          setGameState('gameOver');
          newGameLog.push('🎉 Victory! You have destroyed the AI fleet!');
          setGameLog(newGameLog);
          return;
        }
      } else {
        newGameLog.push(`🎯 Direct hit on AI's ${hitShip.name}!`);
        newGameLog.push(`🤖 AI: "${aiTaunts.hit[Math.floor(Math.random() * aiTaunts.hit.length)]}"`);
      }
    } else {
      newGameLog.push('💨 Miss! Your shot disappears into the void of space.');
      newGameLog.push(`🤖 AI: "${aiTaunts.miss[Math.floor(Math.random() * aiTaunts.miss.length)]}"`);
    }
    
    setGameLog(newGameLog);
    setCurrentTurn('ai');
    
    setTimeout(handleAiTurn, 1500);
  };

  const handleAiTurn = () => {
    if (gameState !== 'playing') return;
    
    let row, col;
    let validShot = false;
    
    while (!validShot) {
      row = Math.floor(Math.random() * 10);
      col = Math.floor(Math.random() * 10);
      validShot = !aiShots.some(shot => shot.row === row && shot.col === col);
    }
    
    const hit = playerBoard[row][col] !== 0;
    const newShot = { row, col, hit };
    const newAiShots = [...aiShots, newShot];
    setAiShots(newAiShots);
    
    let newGameLog = [...gameLog];
    
    if (hit) {
      const shipId = playerBoard[row][col];
      const hitShip = playerShips.find(ship => ship.id === shipId);
      hitShip.hits++;
      
      if (hitShip.hits === hitShip.size) {
        newGameLog.push(`💥 AI sunk your ${hitShip.name}!`);
        newGameLog.push(`🤖 AI: "Another ship for my collection!"`);
        
        if (playerShips.every(ship => ship.hits === ship.size)) {
          setWinner('ai');
          setGameState('gameOver');
          newGameLog.push('💀 Defeat! The AI has destroyed your entire fleet!');
          newGameLog.push(`🤖 AI: "Victory is mine! Humans are so predictable!"`);
          setGameLog(newGameLog);
          return;
        }
      } else {
        newGameLog.push(`💥 AI hit your ${hitShip.name}!`);
        newGameLog.push(`🤖 AI: "${aiTaunts.aiHit[Math.floor(Math.random() * aiTaunts.aiHit.length)]}"`);
      }
    } else {
      newGameLog.push('🌌 AI missed! Their shot flies harmlessly past your fleet.');
      newGameLog.push(`🤖 AI: "${aiTaunts.aiMiss[Math.floor(Math.random() * aiTaunts.aiMiss.length)]}"`);
    }
    
    setGameLog(newGameLog);
    setCurrentTurn('player');
  };

  const renderCell = (board, shots, row, col, isPlayerBoard = false) => {
    const shot = shots.find(s => s.row === row && s.col === col);
    const hasShip = board[row][col] !== 0;
    
    let cellContent = '';
    let cellClass = 'cell w-8 h-8 flex items-center justify-center text-lg cursor-pointer';
    
    if (shot) {
      if (shot.hit) {
        cellContent = '💥';
        cellClass += ' hit';
      } else {
        cellContent = '💨';
        cellClass += ' miss';
      }
    } else if (isPlayerBoard && hasShip) {
      const ship = playerShips.find(s => s.id === board[row][col]);
      cellContent = ship ? ship.emoji : '🚢';
      cellClass += ' ship';
    } else {
      cellContent = '🌌';
      cellClass += ' water';
    }
    
    if (!isPlayerBoard && gameState === 'playing' && currentTurn === 'player') {
      cellClass += ' hover:bg-primary-600/20';
    }
    
    return (
      <div
        key={`${row}-${col}`}
        className={cellClass}
        onClick={() => !isPlayerBoard && handlePlayerShot(row, col)}
        role={!isPlayerBoard ? "button" : undefined}
        tabIndex={!isPlayerBoard && gameState === 'playing' && currentTurn === 'player' ? 0 : -1}
        aria-label={!isPlayerBoard ? `Fire at position ${String.fromCharCode(65 + col)}${row + 1}` : undefined}
        onKeyDown={(e) => {
          if (!isPlayerBoard && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handlePlayerShot(row, col);
          }
        }}
      >
        {cellContent}
      </div>
    );
  };

  const renderBoard = (board, shots, isPlayerBoard = false, title) => (
    <div className="game-card p-6 m-4">
      <h3 className="text-xl font-bold text-center mb-4 text-gray-900 dark:text-white">{title}</h3>
      <div className="grid grid-cols-10 gap-1 max-w-sm mx-auto">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) =>
            renderCell(board, shots, rowIndex, colIndex, isPlayerBoard)
          )
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {gameState === 'setup' && (
        <div className="game-card p-8 text-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to engage in epic space combat?
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Your fleet will be randomly deployed across the galaxy. Prepare for battle!
            </p>
          </div>
          <button 
            onClick={initializeGame}
            className="btn-primary text-xl"
            aria-label="Deploy fleet and start game"
          >
            🚀 DEPLOY FLEET
          </button>
        </div>
      )}
      
      {gameState === 'playing' && (
        <div>
          <div className="game-card p-6 mb-6 text-center">
            <h2 className={`text-2xl font-bold mb-2 ${currentTurn === 'player' ? 'text-green-600' : 'text-red-600'}`}>
              {currentTurn === 'player' ? '🎯 YOUR TURN - Target Enemy Fleet!' : '🤖 AI CALCULATING...'}
            </h2>
            {currentTurn === 'ai' && (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                <span className="text-gray-600 dark:text-gray-300">AI is planning its next move...</span>
              </div>
            )}
          </div>
          
          <div className="grid lg:grid-cols-2 gap-4">
            {renderBoard(aiBoard, playerShots, false, '🎯 ENEMY FLEET (Click to Fire!)')}
            {renderBoard(playerBoard, aiShots, true, '🛡️ YOUR FLEET')}
          </div>
        </div>
      )}
      
      {gameState === 'gameOver' && (
        <div className="game-card p-8 text-center">
          <h2 className={`text-3xl font-bold mb-4 ${winner === 'player' ? 'text-green-600' : 'text-red-600'}`}>
            {winner === 'player' ? '🎉 VICTORY!' : '💀 DEFEAT!'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {winner === 'player' 
              ? 'Congratulations, Commander! You have successfully destroyed the enemy fleet!' 
              : 'The AI has proven superior in this battle. Better luck next time, Commander.'}
          </p>
          <button 
            onClick={initializeGame}
            className="btn-primary text-xl"
            aria-label="Start a new game"
          >
            🔄 PLAY AGAIN
          </button>
        </div>
      )}
      
      {gameLog.length > 0 && (
        <div className="game-card p-6 mt-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            📡 BATTLE LOG
          </h3>
          <div 
            className="max-h-64 overflow-y-auto space-y-2 text-sm"
            role="log"
            aria-live="polite"
            aria-label="Battle log"
          >
            {gameLog.map((log, index) => (
              <div 
                key={index} 
                className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpaceBattleship;
