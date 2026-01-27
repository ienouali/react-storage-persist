import { useStorage } from '../../src/react/useStorage';
import { ExampleCard } from '../components/ExampleCard';
import { CodeBlock } from '../components/CodeBlocks';

interface Settings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: boolean;
  emailFrequency: 'daily' | 'weekly' | 'never';
  fontSize: number;
  soundEnabled: boolean;
}

export function SettingsPanel() {
  const [settings, setSettings] = useStorage<Settings>('demo.settings', {
    theme: 'light',
    language: 'en',
    notifications: true,
    emailFrequency: 'weekly',
    fontSize: 16,
    soundEnabled: true,
  });

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="example-container">
      <h1>Settings Panel</h1>
      <p>Persistent user preferences using complex objects</p>

      <ExampleCard title="Appearance">
        <div className="settings-group">
          <div className="setting-item">
            <label>Theme:</label>
            <select
              value={settings.theme}
              onChange={(e) => updateSetting('theme', e.target.value as Settings['theme'])}
              className="select"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div className="setting-item">
            <label>Font Size: {settings.fontSize}px</label>
            <input
              type="range"
              min="12"
              max="24"
              value={settings.fontSize}
              onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
              className="slider"
            />
          </div>
        </div>
      </ExampleCard>

      <ExampleCard title="Notifications">
        <div className="settings-group">
          <div className="setting-item">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => updateSetting('notifications', e.target.checked)}
                className="checkbox"
              />
              Enable Notifications
            </label>
          </div>

          <div className="setting-item">
            <label>Email Frequency:</label>
            <select
              value={settings.emailFrequency}
              onChange={(e) =>
                updateSetting('emailFrequency', e.target.value as Settings['emailFrequency'])
              }
              className="select"
              disabled={!settings.notifications}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="never">Never</option>
            </select>
          </div>

          <div className="setting-item">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
                className="checkbox"
              />
              Sound Effects
            </label>
          </div>
        </div>
      </ExampleCard>

      <ExampleCard title="Preferences">
        <div className="settings-group">
          <div className="setting-item">
            <label>Language:</label>
            <select
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value)}
              className="select"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
      </ExampleCard>

      <div className="preview-box">
        <h3>Current Settings (JSON)</h3>
        <pre className="json-preview">{JSON.stringify(settings, null, 2)}</pre>
      </div>

      <CodeBlock
        code={`interface Settings {
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  fontSize: number;
}

const [settings, setSettings] = useStorage<Settings>('settings', {
  theme: 'light',
  notifications: true,
  fontSize: 16,
});

// Update specific setting
setSettings(prev => ({ ...prev, theme: 'dark' }));`}
      />

      <div className="info-panel">
        <h3>🎨 Use Cases</h3>
        <ul>
          <li>User preferences across sessions</li>
          <li>Theme and appearance settings</li>
          <li>Complex nested objects</li>
          <li>Type-safe updates</li>
        </ul>
      </div>
    </div>
  );
}
