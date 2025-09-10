import React, { useState, useMemo } from 'react';
import { Check, KeyRound, ChevronLeft, Eye, EyeOff } from 'lucide-react';
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

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activeField, setActiveField] = useState('old'); // 'old' | 'new' | 'confirm'
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
    const isDigit = /^(\d)$/.test(String(key));
    const apply = (valueSetter, current) => {
      if (key === 'bksp') {
        valueSetter(current.slice(0, -1));
      } else if (key === 'clear') {
        valueSetter('');
      } else if (isDigit) {
        if (current.length < 4) {
          valueSetter(current + String(key));
        }
      }
    };

    if (activeField === 'old') apply(setOldPassword, oldPassword);
    if (activeField === 'new') apply(setNewPassword, newPassword);
    if (activeField === 'confirm') apply(setConfirmPassword, confirmPassword);
    // Debug current values
    console.log('activeField:', activeField, 'old:', oldPassword, 'new:', newPassword, 'confirm:', confirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      const currentEmployee = localStorage.getItem('currentEmployee');
      if (!currentEmployee) {
        setError('No logged-in user found');
        return;
      }
      let employeeId = null;
      try {
        const emp = JSON.parse(currentEmployee);
        employeeId = emp?.id;
      } catch {}
      if (!employeeId) {
        setError('Invalid user session');
        return;
      }
      console.log('Submitting change password with:', { employeeId, oldPassword, newPassword });
      const result = await window.myAPI?.changeEmployeePassword(employeeId, oldPassword, newPassword);
      console.log('Change password result:', result);
      if (result?.success) {
        setSuccess('Password changed successfully');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setActiveField('old');
      } else {
        setError(result?.message || 'Failed to change password');
      }
    } catch (err) {
      setError('Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  const PinBoxes = ({ value, onFocus, label, isActive, visible, onToggleVisible }) => {
    const length = Math.min(4, value.length);
    const chars = visible ? value.padEnd(4, ' ') : ''.padStart(length, '•');
    const boxes = new Array(4).fill(null).map((_, idx) => {
      const filled = idx < length;
      const charToShow = visible ? (value[idx] || '') : (filled ? '•' : '');
      return (
        <div
          key={idx}
          className={`h-12 rounded-lg border flex items-center justify-center text-xl font-semibold ${filled ? 'border-primary bg-primaryExtraLight text-primary' : 'border-gray-200 bg-white text-gray-500'}`}
        >
          {charToShow}
        </div>
      );
    });
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className={`w-full rounded-xl ${isActive ? 'ring-2' : ''}`} style={{ ringColor: isActive ? themeColors.primaryLight : undefined }}>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onFocus} className="flex-1">
              <div className={`grid grid-cols-4 gap-3 p-1 rounded-lg ${isActive ? 'bg-primaryExtraLight' : ''}`}>{boxes}</div>
            </button>
            <button type="button" onClick={onToggleVisible} className="p-2 text-gray-600 hover:text-gray-800">
              {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">4-digit numeric PIN</p>
      </div>
    );
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
              <PinBoxes label="Old Password" value={oldPassword} onFocus={() => setActiveField('old')} isActive={activeField==='old'} visible={showOld} onToggleVisible={() => setShowOld(v=>!v)} />
              <PinBoxes label="New Password" value={newPassword} onFocus={() => setActiveField('new')} isActive={activeField==='new'} visible={showNew} onToggleVisible={() => setShowNew(v=>!v)} />
              <PinBoxes label="Confirm Password" value={confirmPassword} onFocus={() => setActiveField('confirm')} isActive={activeField==='confirm'} visible={showConfirm} onToggleVisible={() => setShowConfirm(v=>!v)} />

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
                {['1','2','3','4','5','6','7','8','9'].map(n => (
                  <NumericKey key={n} label={n} onClick={handleKeyPress} />
                ))}
                <NumericKey label={'bksp'} onClick={() => handleKeyPress('bksp')} className="col-span-1">
                </NumericKey>
                <NumericKey label={'0'} onClick={handleKeyPress} />
                <NumericKey label={'clear'} onClick={() => handleKeyPress('clear')} className="col-span-1">
                </NumericKey>
              </div>
              <p className="text-xs text-gray-500 mt-3">Tap a field, then use the keypad to enter 4 digits.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


