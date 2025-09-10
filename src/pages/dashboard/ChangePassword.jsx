import React, { useState, useMemo } from 'react';
import { Eye, EyeOff, Delete, Check, KeyRound, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const NumericKey = ({ label, onClick, className = '' }) => (
  <button
    type="button"
    onClick={() => onClick(label)}
    className={`flex items-center justify-center rounded-lg h-14 text-lg font-semibold border border-gray-200 bg-white hover:bg-gray-50 active:translate-y-[1px] transition ${className}`}
  >
    {label}
  </button>
);

export default function ChangePassword() {
  const navigate = useNavigate();
  const { themeColors } = useTheme();

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activeField, setActiveField] = useState('old'); // 'old' | 'new' | 'confirm'
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const canSubmit = useMemo(() => {
    if (!oldPassword || !newPassword || !confirmPassword) return false;
    if (newPassword !== confirmPassword) return false;
    if (newPassword.length < 4) return false;
    if (newPassword === oldPassword) return false;
    return true;
  }, [oldPassword, newPassword, confirmPassword]);

  const handleKeyPress = (key) => {
    setError('');
    setSuccess('');
    const apply = (valueSetter, current) => {
      if (key === 'bksp') {
        valueSetter(current.slice(0, -1));
      } else if (key === 'clear') {
        valueSetter('');
      } else {
        valueSetter(current + key);
      }
    };

    if (activeField === 'old') apply(setOldPassword, oldPassword);
    if (activeField === 'new') apply(setNewPassword, newPassword);
    if (activeField === 'confirm') apply(setConfirmPassword, confirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      // TODO: Wire backend IPC for real password update
      await new Promise(r => setTimeout(r, 600));
      setSuccess('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setActiveField('old');
    } catch (err) {
      setError('Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 w-full">
      <div className="max-w-4xl mx-auto mt-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ChevronLeft size={18} /> Back
        </button>

        <div
          className="rounded-2xl p-5 md:p-6"
          style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(0,0,0,0.04)'
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <KeyRound size={22} className="text-primary" />
            <h2 className="text-xl font-semibold text-primary">Change Password</h2>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Old Password</label>
                <div className="relative">
                  <input
                    type={showOld ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    onFocus={() => setActiveField('old')}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 focus:outline-none focus:ring-2"
                    style={{ outlineColor: themeColors.primaryLight }}
                    placeholder="Enter old password"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onFocus={() => setActiveField('new')}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 focus:outline-none focus:ring-2"
                    style={{ outlineColor: themeColors.primaryLight }}
                    placeholder="Enter new password"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Must be at least 4 digits; numeric keypad provided.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setActiveField('confirm')}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 focus:outline-none focus:ring-2"
                    style={{ outlineColor: themeColors.primaryLight }}
                    placeholder="Re-enter new password"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}
              {success && (
                <div className="text-sm text-green-600">{success}</div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={!canSubmit || submitting}
                  className={`px-4 py-2 rounded-lg text-white font-semibold btn-lifted ${canSubmit && !submitting ? 'bg-primary hover:bg-primary/90' : 'bg-gray-400 cursor-not-allowed'}`}
                >
                  <div className="flex items-center gap-2">
                    <Check size={16} />
                    {submitting ? 'Saving...' : 'Change Password'}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => { setOldPassword(''); setNewPassword(''); setConfirmPassword(''); setActiveField('old'); setError(''); setSuccess(''); }}
                  className="px-4 py-2 rounded-lg font-semibold border border-gray-200 bg-white hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="">
              <div className="grid grid-cols-3 gap-3 select-none">
                {['1','2','3','4','5','6','7','8','9','0'].slice(0,9).map(n => (
                  <NumericKey key={n} label={n} onClick={handleKeyPress} />
                ))}
                <NumericKey label={'bksp'} onClick={() => handleKeyPress('bksp')} className="col-span-1">
                </NumericKey>
                <NumericKey label={'0'} onClick={handleKeyPress} />
                <NumericKey label={'clear'} onClick={() => handleKeyPress('clear')} className="col-span-1">
                </NumericKey>
              </div>
              <p className="text-xs text-gray-500 mt-3">Tap a field, then use the keypad to enter digits.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


