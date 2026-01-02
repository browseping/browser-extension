import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import { useAuth } from '../../context/AuthContext';
import { fetchLeaderboard, fetchUserRank } from '../../../services/api';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaTrophy } from 'react-icons/fa';
import { AiOutlineLoading } from 'react-icons/ai';
import UserProfile from '../profile/OtherUserProfile';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  monthlySeconds: number;
  monthlyHours: number;
  totalOnlineHours: number;
}

interface LeaderboardData {
  month: string;
  leaderboard: LeaderboardEntry[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    hasNext: boolean;
    hasPrev: boolean;
    startRank: number;
    endRank: number;
  };
}

interface UserRank {
  rank: number | null;
  totalSeconds: number;
  totalHours: number;
  month: string;
  totalUsers: number;
}

const formatDuration = (hours: number) => {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${hours.toFixed(1)}h`;
};

const LeaderboardPanel: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user } = useAuth();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<{username: string, userId: string} | null>(null);

  const loadLeaderboard = async (page: number) => {
    if (!user) return;
    setLoading(true);
    try {
      const [leaderboardRes, rankRes] = await Promise.all([
        fetchLeaderboard(user.token, page, 10),
        fetchUserRank(user.token)
      ]);
      
      if (leaderboardRes.success) {
        setData(leaderboardRes.data);
      }
      if (rankRes.success) {
        setUserRank(rankRes.data);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard(currentPage);
  }, [user, currentPage]);

  const handlePageChange = (selectedItem: { selected: number }) => {
    const page = selectedItem.selected + 1;
    setCurrentPage(page);
  };

  const handleBackFromProfile = () => {
    setSelectedUser(null);
  };

  if (selectedUser) {
    return (
      <UserProfile
        username={selectedUser.username}
        userId={selectedUser.userId}
        onBack={handleBackFromProfile}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <AiOutlineLoading className="animate-spin h-8 w-8 text-blue-500 mb-4" />
        <span className="text-gray-500">Loading leaderboard...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-red-500 py-8">
        Failed to load leaderboard
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-2 text-white">
        <div>
          <h2 className="text-lg font-bold">Monthly Leaderboard</h2>
          <div className="flex items-center space-x-2 text-xs opacity-90">
            <span className="bg-white/20 px-2 py-0.5 rounded">
              {data.month}
            </span>
            <span>•</span>
            <span>{data.pagination.totalUsers} competitors</span>
          </div>
        </div>
      </div>

      {/* Your Rank */}
      {userRank && userRank.rank && (
        <div className="mb-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-blue-600 font-medium">Your Rank</div>
              <div className="text-base font-bold text-blue-700">#{userRank.rank}</div>
            </div>
            <div className="text-sm text-blue-600">
              {formatDuration(userRank.totalHours)} this month
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="flex-1 overflow-y-auto mb-2 space-y-1.5">
        {data.leaderboard.map((entry) => (
          <div
            key={entry.userId}
            className={`p-2 rounded-lg border ${
              entry.userId === user?.id
                ? 'bg-blue-50 border-blue-200'
                : 'bg-white border-gray-200'
            } cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all`}
            onClick={() => setSelectedUser({
              username: entry.username,
              userId: entry.userId
            })}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full font-bold text-sm ${
                  entry.rank <= 3
                    ? entry.rank === 1
                      ? 'bg-yellow-100 text-yellow-700'
                      : entry.rank === 2
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-orange-100 text-orange-700'
                    : 'bg-gray-50 text-gray-600'
                }`}>
                  {entry.rank <= 3 ? (
                    entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'
                  ) : (
                    entry.rank
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    {entry.displayName || entry.username}
                  </div>
                  <div className="text-xs text-gray-500">@{entry.username}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900 text-sm">
                  {formatDuration(entry.monthlyHours)}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDuration(entry.totalOnlineHours)} total
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="border-t pt-2">        
        <div className="flex items-center justify-between">
          <button
            onClick={() => handlePageChange({ selected: currentPage - 2 })}
            disabled={!data.pagination.hasPrev}
            className={`flex items-center px-3 py-1 rounded-lg text-sm font-medium transition ${
              data.pagination.hasPrev
                ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Numbers */}
          <div className="flex space-x-1">
            <ReactPaginate
              pageCount={data.pagination.totalPages}
              pageRangeDisplayed={2}
              marginPagesDisplayed={1}
              onPageChange={handlePageChange}
              forcePage={currentPage - 1}
              containerClassName="flex items-center space-x-1"
              pageClassName=""
              pageLinkClassName="w-7 h-7 flex items-center justify-center text-xs rounded-lg text-blue-600 hover:bg-blue-50 transition"
              activeClassName=""
              activeLinkClassName="bg-blue-100 text-blue-700 font-semibold"
              breakClassName=""
              breakLinkClassName="w-7 h-7 flex items-center justify-center text-xs text-gray-400"
              disabledClassName="hidden"
              disabledLinkClassName="hidden"
              previousClassName="hidden"
              nextClassName="hidden"
              breakLabel="..."
            />
          </div>

          {/* Next Button */}
          <button
            onClick={() => handlePageChange({ selected: currentPage })}
            disabled={!data.pagination.hasNext}
            className={`flex items-center px-3 py-1 rounded-lg text-sm font-medium transition ${
              data.pagination.hasNext
                ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPanel;