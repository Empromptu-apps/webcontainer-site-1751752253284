import React, { useState } from 'react';

const ApiDebugger = () => {
  const [apiCalls, setApiCalls] = useState([]);
  const [showDebug, setShowDebug] = useState(false);
  const [gameData, setGameData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE = 'https://builder.impromptu-labs.com/api_tools';
  const headers = {
    'Authorization': 'Bearer 4e31d5e989125dc49a09d234c59e85bc',
    'X-Generated-App-ID': '2ed60e32-b396-44ce-822d-44acb787e761',
    'Content-Type': 'application/json'
  };

  const logApiCall = (method, endpoint, data, response) => {
    const call = {
      timestamp: new Date().toISOString(),
      method,
      endpoint,
      data,
      response,
      id: Date.now()
    };
    setApiCalls(prev => [call, ...prev]);
  };

  const saveGameData = async () => {
    setIsLoading(true);
    try {
      const gameState = {
        timestamp: new Date().toISOString(),
        game: 'Space Battleship',
        status: 'Game data saved for analysis'
      };

      const response = await fetch(`${API_BASE}/input_data`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          created_object_name: 'battleship_game_data',
          data_type: 'strings',
          input_data: [JSON.stringify(gameState)]
        })
      });

      const result = await response.json();
      logApiCall('POST', '/input_data', {
        created_object_name: 'battleship_game_data',
        data_type: 'strings',
        input_data: [JSON.stringify(gameState)]
      }, result);

      setGameData(result);
    } catch (error) {
      logApiCall('POST', '/input_data', 'Error', error.message);
    }
    setIsLoading(false);
  };

  const deleteGameData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/objects/battleship_game_data`, {
        method: 'DELETE',
        headers
      });

      const result = await response.text();
      logApiCall('DELETE', '/objects/battleship_game_data', null, result);
      setGameData(null);
    } catch (error) {
      logApiCall('DELETE', '/objects/battleship_game_data', 'Error', error.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={saveGameData}
          disabled={isLoading}
          className="btn-success flex items-center gap-2"
          aria-label="Save game data to API"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            '💾'
          )}
          Save Game Data
        </button>
        
        <button
          onClick={deleteGameData}
          disabled={isLoading}
          className="btn-danger flex items-center gap-2"
          aria-label="Delete game data from API"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            '🗑️'
          )}
          Delete Game Data
        </button>
        
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-gray-500/50"
          aria-label="Toggle API debug information"
        >
          {showDebug ? '🔍 Hide Debug' : '🔍 Show Debug'}
        </button>
      </div>

      {showDebug && (
        <div className="game-card p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            🔧 API Debug Information
          </h3>
          
          {gameData && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Current Game Data Object:</h4>
              <pre className="text-sm text-green-700 dark:text-green-300 overflow-x-auto">
                {JSON.stringify(gameData, null, 2)}
              </pre>
            </div>
          )}

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {apiCalls.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No API calls made yet. Use the buttons above to interact with the API.
              </p>
            ) : (
              apiCalls.map((call) => (
                <div key={call.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {call.method} {call.endpoint}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(call.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {call.data && (
                    <div className="mb-2">
                      <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Request:</h5>
                      <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto text-gray-800 dark:text-gray-200">
                        {typeof call.data === 'string' ? call.data : JSON.stringify(call.data, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Response:</h5>
                    <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto text-gray-800 dark:text-gray-200">
                      {typeof call.response === 'string' ? call.response : JSON.stringify(call.response, null, 2)}
                    </pre>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiDebugger;
