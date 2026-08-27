import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function UserInfo({ onBack, onOpenPricing }) {
  const { user, profile, updateProfile, updateAuth } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(profile?.avatar_url || '');

  // Form State
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    full_name: profile?.full_name || '',
    email: user?.email || '',
    password: ''
  });

  useEffect(() => {
    if (profile || user) {
      setFormData(prev => ({
        ...prev,
        username: profile?.username || prev.username,
        full_name: profile?.full_name || prev.full_name,
        email: user?.email || prev.email,
      }));
      if (!avatarFile) setPreviewUrl(profile?.avatar_url || '');
    }
  }, [profile, user, avatarFile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      if (img.width > 512 || img.height > 512) {
        setMessage({ text: 'Image must be 512x512 or smaller.', type: 'error' });
      } else {
        setAvatarFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setMessage({ text: '', type: '' });
      }
    };
    img.src = URL.createObjectURL(file);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const profileUpdates = {};

      // Store a small local preview for this browser session.
      if (avatarFile) {
        profileUpdates.avatar_url = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('Unable to read the selected image.'));
          reader.readAsDataURL(avatarFile);
        });
      }

      // 2. Check & Update Profile Data
      if (formData.username !== (profile?.username || '')) profileUpdates.username = formData.username;
      if (formData.full_name !== (profile?.full_name || '')) profileUpdates.full_name = formData.full_name;

      if (Object.keys(profileUpdates).length > 0) {
        const { error } = await updateProfile(profileUpdates);
        if (error) throw new Error(`Profile Error: ${error.message}`);
      }

      // 3. Check & Update Auth Data
      if (formData.email !== user?.email) {
        const { error } = await updateAuth({ email: formData.email });
        if (error) throw new Error(`Email Error: ${error.message}`);
        setMessage({ text: 'Check your new email inbox to confirm the change!', type: 'success' });
      }

      if (formData.password) {
        const { error } = await updateAuth({ password: formData.password });
        if (error) throw new Error(`Password Error: ${error.message}`);
        setFormData(prev => ({ ...prev, password: '' })); 
      }

      if (!message.text) setMessage({ text: 'Settings successfully updated.', type: 'success' });
      setAvatarFile(null); // Reset file state upon successful upload
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile Information' },
    { id: 'security', label: 'Sign in & Security' },
    { id: 'data', label: 'System Data & Stats' }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 50px', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif', width: '100%', boxSizing: 'border-box' }}>
      
      <style>{`
        .sidebar-btn { width: 100%; text-align: left; padding: 14px 20px; background: transparent; border: none; color: #888; font-size: 15px; font-weight: 600; cursor: pointer; border-radius: 6px; transition: all 0.2s ease; border-left: 3px solid transparent; }
        .sidebar-btn:hover { background: #0a0a0a; color: #ccc; }
        .sidebar-btn.active { background: #111; color: #fff; border-left: 3px solid #ededed; }
        .settings-card { background: #0a0a0a; border: 1px solid #222; border-radius: 12px; padding: 35px; margin-bottom: 25px; box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
        .input-group { margin-bottom: 25px; }
        .input-label { display: block; color: #888; font-size: 12px; font-weight: bold; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .input-field { width: 100%; padding: 14px 16px; background: #050505; border: 1px solid #333; color: #fff; border-radius: 8px; box-sizing: border-box; font-size: 15px; outline: none; transition: border-color 0.2s; }
        .input-field:focus { border-color: #666; }
        .stat-row { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #1a1a1a; }
        .stat-row:last-child { border-bottom: none; padding-bottom: 0; }
      `}</style>

      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginBottom: '20px', fontSize: '15px', fontWeight: 'bold', padding: 0, transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#888'}>
        ← Back to Dashboard
      </button>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: '900', margin: '0 0 5px 0', letterSpacing: '-0.5px' }}>Account Preferences</h1>
          <p style={{ color: '#888', margin: 0, fontSize: '16px' }}>Manage your identity, security, and Kinetree data.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{profile?.username || 'User'}</div>
            <div style={{ color: '#4caf50', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>{profile?.tier || 'Free'} Tier</div>
          </div>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#222', border: '1px solid #444', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {previewUrl ? (
              <img src={previewUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
            ) : (
              <span style={{ color: '#666', fontSize: '20px', fontWeight: 'bold' }}>{(profile?.username || '?').charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
        <div style={{ flex: '0 0 260px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {tabs.map(tab => (
            <button key={tab.id} className={`sidebar-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, maxWidth: '800px' }}>
          {message.text && (
            <div style={{ padding: '16px 20px', borderRadius: '8px', marginBottom: '25px', background: message.type === 'success' ? 'rgba(76,175,80,0.1)' : 'rgba(255,68,68,0.1)', color: message.type === 'success' ? '#4caf50' : '#ff4444', border: `1px solid ${message.type === 'success' ? '#4caf50' : '#ff4444'}`, fontWeight: '500' }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleUpdate}>
            {activeTab === 'profile' && (
              <>
                <div className="settings-card">
                  <h3 style={{ margin: '0 0 25px 0', fontSize: '20px', borderBottom: '1px solid #222', paddingBottom: '15px' }}>Public Identity</h3>
                  
                  {/* Custom File Upload Section */}
                  <div className="input-group">
                    <label className="input-label">Profile Avatar</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#222', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #444' }}>
                        {previewUrl ? (
                          <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ color: '#666', fontSize: '20px', fontWeight: 'bold' }}>{(formData.username || '?').charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <label style={{ background: '#111', border: '1px solid #333', padding: '10px 16px', borderRadius: '6px', color: '#ededed', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'background 0.2s' }} onMouseEnter={e => e.target.style.background = '#222'} onMouseLeave={e => e.target.style.background = '#111'}>
                        Upload Image
                        <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleAvatarChange} style={{ display: 'none' }} />
                      </label>
                      <span style={{ color: '#666', fontSize: '12px' }}>Max: 512x512 pixels</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                      <label className="input-label">Username</label>
                      <input type="text" name="username" value={formData.username} onChange={handleChange} className="input-field" placeholder="e.g., KinetreeMaster" />
                    </div>
                    <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                      <label className="input-label">Full Name</label>
                      <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="input-field" placeholder="e.g., Ada Lovelace" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'security' && (
              <div className="settings-card">
                <h3 style={{ margin: '0 0 25px 0', fontSize: '20px', borderBottom: '1px solid #222', paddingBottom: '15px' }}>Account Access</h3>
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" />
                  <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '12px' }}>Changing this will send a confirmation link to your new address.</p>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Change Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} className="input-field" placeholder="Leave blank to keep current password" />
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="settings-card">
                <h3 style={{ margin: '0 0 25px 0', fontSize: '20px', borderBottom: '1px solid #222', paddingBottom: '15px' }}>System Metrics</h3>
                
                <div className="stat-row">
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Experience Points (XP)</div>
                    <div style={{ color: '#666', fontSize: '13px', marginTop: '4px' }}>Total knowledge accrued across all trees.</div>
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '18px', fontWeight: 'bold', color: '#ededed' }}>{profile?.xp || 0} XP</div>
                </div>

                <div className="stat-row">
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Current Plan</div>
                    <div style={{ color: '#666', fontSize: '13px', marginTop: '4px' }}>Your active Kinetree subscription tier.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '15px', color: profile?.tier === 'Unlimited' ? '#4caf50' : '#fff' }}>{profile?.tier || 'Free'}</div>
                    {profile?.tier !== 'Unlimited' && (
                      <button type="button" onClick={onOpenPricing} style={{ background: '#4caf50', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'opacity 0.2s' }} onMouseEnter={e => e.target.style.opacity = '0.8'} onMouseLeave={e => e.target.style.opacity = '1'}>
                        Upgrade?
                      </button>
                    )}
                  </div>
                </div>

                <div className="stat-row">
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Account ID</div>
                      <div style={{ color: '#666', fontSize: '13px', marginTop: '4px' }}>Unique local profile identifier.</div>
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#888', background: '#111', padding: '6px 10px', borderRadius: '4px' }}>{user?.id}</div>
                </div>
              </div>
            )}

            {activeTab !== 'data' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="submit" disabled={loading} style={{ 
                  padding: '14px 28px', background: '#ededed', color: '#000', border: 'none', 
                  borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '15px',
                  opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s'
                }}>
                  {loading ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            )}

          </form>
        </div>
      </div>

    </div>
  );
}