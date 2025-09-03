import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ProfilePage() {
  const router = useRouter();
  const { userId } = router.query;

  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [sex, setSex] = useState('');
  const [age, setAge] = useState('');
  const [phones, setPhones] = useState(['']);
  const [addresses, setAddresses] = useState(['']);
  const [password, setPassword] = useState('');  // New state for password

  useEffect(() => {
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge);
    } else {
      setAge('');
    }
  }, [dob]);

  function handlePhoneChange(index, value) {
    const newPhones = [...phones];
    newPhones[index] = value;
    setPhones(newPhones);
  }

  function addPhone() {
    setPhones([...phones, '']);
  }

  function removePhone(index) {
    if (phones.length === 1) return;
    const newPhones = phones.filter((_, i) => i !== index);
    setPhones(newPhones);
  }

  function handleAddressChange(index, value) {
    const newAddresses = [...addresses];
    newAddresses[index] = value;
    setAddresses(newAddresses);
  }

  function addAddress() {
    setAddresses([...addresses, '']);
  }

  function removeAddress(index) {
    if (addresses.length === 1) return;
    const newAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(newAddresses);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!userId) {
      alert('Missing userId');
      return;
    }
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        name,
        dob,
        sex,
        age,
        phones,
        addresses,
        password,  // Include password in request if provided
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.message || 'Profile save failed');
      return;
    }
    alert(data.message);
    setPassword('');  // Clear password field after submission
  }

  return (
    <div style={styles.container}>
      <h1>Profile</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label>
          Name:
          <input
            style={styles.input}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </label>

        <label>
          Date of Birth:
          <input
            style={styles.input}
            type="date"
            value={dob}
            onChange={e => setDob(e.target.value)}
            required
          />
        </label>

        <label>
          Age:
          <input
            style={styles.input}
            type="number"
            value={age}
            onChange={e => setAge(e.target.value)}
            min="0"
          />
        </label>

        <label>
          Sex:
          <select
            style={styles.input}
            value={sex}
            onChange={e => setSex(e.target.value)}
            required
          >
            <option value="">Select sex</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label>
          New Password (optional):
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter new password to update"
          />
        </label>

        <fieldset style={styles.fieldset}>
          <legend>Phone Numbers</legend>
          {phones.map((phone, index) => (
            <div key={index} style={styles.flexRow}>
              <input
                style={{ ...styles.input, flex: 1 }}
                type="tel"
                value={phone}
                onChange={e => handlePhoneChange(index, e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => removePhone(index)}
                disabled={phones.length === 1}
                style={styles.smallButton}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addPhone} style={styles.addButton}>
            Add Phone
          </button>
        </fieldset>

        <fieldset style={styles.fieldset}>
          <legend>Addresses</legend>
          {addresses.map((address, index) => (
            <div key={index} style={styles.flexRow}>
              <input
                style={{ ...styles.input, flex: 1 }}
                type="text"
                value={address}
                onChange={e => handleAddressChange(index, e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => removeAddress(index)}
                disabled={addresses.length === 1}
                style={styles.smallButton}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addAddress} style={styles.addButton}>
            Add Address
          </button>
        </fieldset>

        <button type="submit" style={styles.button}>
          Save / Update Profile
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 600,
    margin: '40px auto',
    padding: 20,
    border: '1px solid #ccc',
    borderRadius: 5,
    fontFamily: 'Arial, sans-serif',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 15,
  },
  input: {
    padding: 8,
    fontSize: 16,
    width: '100%',
    boxSizing: 'border-box',
  },
  button: {
    padding: 12,
    fontSize: 16,
    cursor: 'pointer',
    marginTop: 10,
  },
  smallButton: {
    marginLeft: 10,
    padding: '6px 12px',
    cursor: 'pointer',
  },
  addButton: {
    padding: '8px 12px',
    cursor: 'pointer',
    marginTop: 5,
    width: 'fit-content',
  },
  flexRow: {
    display: 'flex',
    alignItems: 'center',
  },
  fieldset: {
    border: '1px solid #ccc',
    borderRadius: 5,
    padding: 10,
  },
};
