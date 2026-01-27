import { useStorage } from '../../src/react/useStorage';
import { ExampleCard } from '../components/ExampleCard';
import { CodeBlock } from '../components/CodeBlocks';
import React from 'react';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  message: string;
  newsletter: boolean;
}

export function FormPersistence() {
  const [formData, setFormData] = useStorage<FormData>('demo.contactForm', {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    message: '',
    newsletter: false,
  });

  const [submitted, setSubmitted] = useStorage('demo.formSubmitted', false);

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    window.setTimeout(() => {
      setSubmitted(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        message: '',
        newsletter: false,
      });
    }, 3000);
  };

  const clearDraft = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: '',
      message: '',
      newsletter: false,
    });
  };

  const isFormFilled = Object.values(formData).some((value) =>
    typeof value === 'string' ? value.trim() !== '' : value === true
  );

  return (
    <div className="example-container">
      <h1>Form Draft Persistence</h1>
      <p>Never lose your form data - automatically saved as you type</p>

      {submitted && (
        <div className="alert alert-success">✅ Form submitted successfully! Draft cleared.</div>
      )}

      <ExampleCard title="Contact Form">
        <form onSubmit={handleSubmit} className="form">
          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                required
                className="input"
              />
            </div>

            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                required
                className="input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                required
                className="input"
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              className="input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                className="input"
              />
            </div>

            <div className="form-group">
              <label>Country</label>
              <select
                value={formData.country}
                onChange={(e) => updateField('country', e.target.value)}
                className="select"
              >
                <option value="">Select...</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Message *</label>
            <textarea
              value={formData.message}
              onChange={(e) => updateField('message', e.target.value)}
              required
              rows={4}
              className="textarea"
            />
          </div>

          <div className="form-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={formData.newsletter}
                onChange={(e) => updateField('newsletter', e.target.checked)}
                className="checkbox"
              />
              Subscribe to newsletter
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={clearDraft} className="btn btn-secondary">
              Clear Draft
            </button>
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
        </form>

        {isFormFilled && <div className="alert alert-info">💾 Draft saved automatically</div>}
      </ExampleCard>

      <CodeBlock
        code={`const [formData, setFormData] = useStorage('contactForm', {
  firstName: '',
  email: '',
  message: '',
});

// Update field
const updateField = (field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }));
};

<input
  value={formData.firstName}
  onChange={(e) => updateField('firstName', e.target.value)}
/>`}
      />

      <div className="info-panel">
        <h3>📝 Benefits</h3>
        <ul>
          <li>Never lose form progress</li>
          <li>Auto-saves as user types</li>
          <li>Survives page refreshes</li>
          <li>Perfect for long forms</li>
        </ul>
      </div>
    </div>
  );
}
