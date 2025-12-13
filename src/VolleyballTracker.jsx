import React, { useState } from 'react';
import {
  RotateCcw,
  Users,
  TrendingUp,
  Plus,
  Trash2,
  Copy,
  RefreshCw,
} from 'lucide-react';

export default function VolleyballTracker() {
  const [currentSet, setCurrentSet] = useState(1);
  const [sets, setSets] = useState([
    { set: 1, us: 0, them: 0, timeouts: [], lastScorer: null, startLineup: null },
  ]);

  const [serviceHits, setServiceHits] = useState([]);
  const [ourPointHits, setOurPointHits] = useState([]);

  const [lineup, setLineup] = useState(
    Array(6).fill({ playerId: null, role: null, originalPlayerId: null })
  );

  const [allPlayers, setAllPlayers] = useState([]);
  const [playerStats, setPlayerStats] = useState({});
  const [activeTab, setActiveTab] = useState('players');

  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerNumber, setNewPlayerNumber] = useState('');

  const [showLineupModal, setShowLineupModal] = useState(false);
  const [pendingLineup, setPendingLineup] = useState(null);

  const [liberoPlayer, setLiberoPlayer] = useState(null);
  const [showFireworks, setShowFireworks] = useState(false);
  const [setWinner, setSetWinner] = useState(null);
  const [overlaySet, setOverlaySet] = useState(null);

  const roles = ['Passer/Loper', 'Midden', 'Spelverdeler', 'Diagonaal'];

  const courtPositions = [
    { id: 0, x: 15, y: 35, label: 'Pos 4' },
    { id: 1, x: 50, y: 35, label: 'Pos 3' },
    { id: 2, x: 85, y: 35, label: 'Pos 2' },
    { id: 3, x: 15, y: 65, label: 'Pos 5' },
    { id: 4, x: 50, y: 65, label: 'Pos 6' },
    { id: 5, x: 85, y: 65, label: 'Pos 1' },
  ];

  /* ---------------- PLAYERS ---------------- */

  const addPlayer = () => {
    if (!newPlayerName.trim() || !newPlayerNumber.trim()) return;

    const newPlayer = {
      id: Date.now(),
      name: newPlayerName.trim(),
      number: newPlayerNumber.trim(),
    };

    setAllPlayers([...allPlayers, newPlayer]);
    setPlayerStats({ ...playerStats, [newPlayer.id]: 0 });

    setNewPlayerName('');
    setNewPlayerNumber('');
  };

  const removePlayer = (playerId) => {
    setAllPlayers(allPlayers.filter((p) => p.id !== playerId));

    const stats = { ...playerStats };
    delete stats[playerId];
    setPlayerStats(stats);

    setLineup(
      lineup.map((p) =>
        p.playerId === playerId
          ? { playerId: null, role: null, originalPlayerId: null }
          : p
      )
    );

    if (liberoPlayer === playerId) setLiberoPlayer(null);
  };

  /* ---------------- LINEUP ---------------- */

  const assignToPosition = (idx, playerId, role) => {
    let assignedRole = role;

    if (!assignedRole && playerId) {
      if (idx === 0) assignedRole = 'Diagonaal';
      if (idx === 1) assignedRole = 'Midden';
      if (idx === 2) assignedRole = 'Passer/Loper';
      if (idx === 3) assignedRole = 'Passer/Loper';
      if (idx === 4) assignedRole = 'Midden';
      if (idx === 5) assignedRole = 'Spelverdeler';
    }

    const newLineup = [...lineup];
    newLineup[idx] = {
      playerId,
      role: assignedRole,
      originalPlayerId: playerId,
    };
    setLineup(newLineup);
  };

  const rotateLineup = () => {
    const l = [...lineup];
    const temp = l[5];
    [l[5], l[2], l[1], l[0], l[3], l[4]] = [
      l[2],
      l[1],
      l[0],
      l[3],
      l[4],
      temp,
    ];

    if (l[4].role === 'Midden' && liberoPlayer) {
      l[4] = {
        playerId: liberoPlayer,
        role: 'Libero',
        originalPlayerId: l[4].playerId,
      };
    }

    if (l[0].role === 'Libero' && l[0].originalPlayerId) {
      l[0] = {
        playerId: l[0].originalPlayerId,
        role: 'Midden',
        originalPlayerId: null,
      };
    }

    setLineup(l);
  };

  /* ---------------- SCORE ---------------- */

  const updateScore = (team, delta) => {
    const current = sets.find((s) => s.set === currentSet);
    const winPoints = currentSet === 5 ? 15 : 25;

    const isSetWon =
      (current.us >= winPoints && current.us - current.them >= 2) ||
      (current.them >= winPoints && current.them - current.us >= 2);

    if (isSetWon) return;

    const shouldRotate = team === 'us' && current.lastScorer === 'them';

    const newUs = team === 'us' ? current.us + delta : current.us;
    const newThem = team === 'them' ? current.them + delta : current.them;

    setSets(
      sets.map((s) =>
        s.set === currentSet
          ? {
              ...s,
              us: Math.max(0, newUs),
              them: Math.max(0, newThem),
              lastScorer: team,
            }
          : s
      )
    );

    if (shouldRotate && delta > 0) {
      setTimeout(rotateLineup, 100);
    }
  };

  /* ---------------- RENDER ---------------- */

  const currentSetData = sets.find((s) => s.set === currentSet);

  return (
    <div className="min-h-screen bg-orange-50 p-3">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-orange-600 mb-3">
          🏐 Volleyball Match Tracker
        </h1>

        <div className="flex gap-2 mb-3">
          {['players', 'lineup', 'game', 'stats'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                activeTab === tab
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'players' && (
          <div>
            <div className="flex gap-2 mb-2">
              <input
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Naam"
                className="flex-1 p-2 border rounded"
              />
              <input
                value={newPlayerNumber}
                onChange={(e) => setNewPlayerNumber(e.target.value)}
                placeholder="Nr"
                className="w-20 p-2 border rounded text-center"
              />
              <button
                onClick={addPlayer}
                className="bg-green-500 text-white px-4 rounded"
              >
                <Plus />
              </button>
            </div>

            {allPlayers.map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center bg-white p-2 rounded mb-1"
              >
                <div>
                  #{p.number} {p.name}
                </div>
                <button onClick={() => removePlayer(p.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'game' && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => updateScore('us', 1)}
              className="bg-blue-100 p-4 rounded text-3xl"
            >
              {currentSetData.us}
            </button>
            <button
              onClick={() => updateScore('them', 1)}
              className="bg-red-100 p-4 rounded text-3xl"
            >
              {currentSetData.them}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
