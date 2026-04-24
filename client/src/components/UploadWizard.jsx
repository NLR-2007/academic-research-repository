import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { categoryApi, paperApi } from '../api/endpoints.js';

const initialForm = {
  title: '',
  authors: [],
  abstract: '',
  keywords: [],
  journal: '',
  year: '',
  volume: '',
  issue: '',
  doi: '',
  category_id: '',
  sub_category: '',
  visibility: 'public',
  license: 'open_access',
  declaration: false
};

export default function UploadWizard() {
  const [step, setStep] = useState(1);
  const [fileMeta, setFileMeta] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [duplicate, setDuplicate] = useState(null);
  const [done, setDone] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    categoryApi.list().then(({ data }) => setCategories(data));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 20 * 1024 * 1024,
    multiple: false,
    onDrop: async ([file]) => {
      if (!file) return;
      setError('');
      try {
        const body = new FormData();
        body.append('pdf', file);
        const { data } = await paperApi.uploadTemp(body);
        setFileMeta(data);
        setStep(2);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not upload the PDF. Please try again.');
      }
    }
  });

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function extract() {
    setError('');
    setMessage('Extracting metadata from PDF...');
    try {
      const { data } = await paperApi.extract({ tempPath: fileMeta.tempPath });
      setForm((current) => ({ ...current, ...data }));
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Metadata extraction failed.');
    } finally {
      setMessage('');
    }
  }

  async function checkAndPreview() {
    setError('');
    try {
      const { data } = await paperApi.duplicateCheck(form.title);
      setDuplicate(data);
      setStep(5);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not run duplicate check.');
    }
  }

  async function submit() {
    setError('');
    setMessage('Submitting your paper...');
    try {
      const { data } = await paperApi.submit({ ...form, tempPath: fileMeta.tempPath });
      setDone(data);
      setStep(6);
    } catch (err) {
      setError(err.response?.data?.message || 'Paper submission failed. Please check that the backend server is running.');
    } finally {
      setMessage('');
    }
  }

  function arrayInput(name, label) {
    const value = Array.isArray(form[name]) ? form[name] : [];
    return (
      <div>
        <label>{label}</label>
        <div className="inline-form">
          <input id={`${name}-input`} placeholder={`Add ${label.toLowerCase()}`} />
          <button type="button" onClick={() => {
            const input = document.getElementById(`${name}-input`);
            if (input.value.trim()) update(name, [...value, input.value.trim()]);
            input.value = '';
          }}>Add</button>
        </div>
        <div className="tag-row">
          {value.map((item) => (
            <button key={item} type="button" className="tag" onClick={() => update(name, value.filter((x) => x !== item))}>
              {item} ×
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <section className="wizard-container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ width: '4rem', height: '4rem', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem' }}>✓</div>
        <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem', color: 'var(--forest)' }}>Submission received</h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--muted)' }}>{done.message}</p>
        <div className="tracker" style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <span className="chip active" style={{ background: 'var(--forest)', color: 'white' }}>Submitted</span>
          <span className="chip pending">Pending Review</span>
          <span className="chip">Decision</span>
        </div>
      </section>
    );
  }

  return (
    <section className="wizard-container">
      <div className="wizard-step-bar">
        {[1, 2, 3, 4, 5, 6].map((num) => (
          <div key={num} className={`wizard-step ${step === num ? 'active' : ''} ${step > num ? 'completed' : ''}`}>
            {step > num ? '✓' : num}
          </div>
        ))}
      </div>
      <div className="wizard-header" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.4rem', color: 'var(--forest)' }}>Upload Research Paper</h1>
        <p className="muted">Follow the steps to submit your work to the repository.</p>
      </div>
      
      {error && <p className="warning" style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.8rem', textAlign: 'center' }}>{error}</p>}
      {message && <p className="muted" style={{ textAlign: 'center', fontWeight: 'bold' }}>{message}</p>}

      {step === 1 && (
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
          <input {...getInputProps()} />
          <h2>Drop your PDF here</h2>
          <p>PDF only, maximum size 20MB. You can also click to choose a file.</p>
        </div>
      )}

      {step === 2 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--forest)' }}>Auto Metadata Extraction</h2>
          <div className="glass-card" style={{ maxWidth: '400px', margin: '0 auto 2rem' }}>
            <span className="metric-label">Selected File</span>
            <strong style={{ fontSize: '1.2rem', wordBreak: 'break-all' }}>{fileMeta.fileName}</strong>
            <small>{Math.round(fileMeta.size / 1024)} KB</small>
          </div>
          <button style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={extract}>Extract with pdf-parse</button>
        </div>
      )}

      {step === 3 && (
        <div className="form-grid">
          <label>Title<input value={form.title} onChange={(e) => update('title', e.target.value)} required /></label>
          {arrayInput('authors', 'Authors')}
          <label>Abstract<textarea value={form.abstract} onChange={(e) => update('abstract', e.target.value)} required /></label>
          {arrayInput('keywords', 'Keywords')}
          <label>Journal / Conference<input value={form.journal} onChange={(e) => update('journal', e.target.value)} /></label>
          <label>Year<input type="number" value={form.year} onChange={(e) => update('year', e.target.value)} required /></label>
          <label>Volume<input value={form.volume} onChange={(e) => update('volume', e.target.value)} /></label>
          <label>Issue<input value={form.issue} onChange={(e) => update('issue', e.target.value)} /></label>
          <label>DOI<input value={form.doi} onChange={(e) => update('doi', e.target.value)} pattern="10\.\d{4,9}/[A-Za-z0-9._;()/:-]+" /></label>
          <label>Category<select value={form.category_id} onChange={(e) => update('category_id', e.target.value)} required>
            <option value="">Choose category</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select></label>
          <label>Sub-category<input value={form.sub_category} onChange={(e) => update('sub_category', e.target.value)} /></label>
          <button onClick={() => setStep(4)}>Continue</button>
        </div>
      )}

      {step === 4 && (
        <div className="form-grid">
          <fieldset>
            <legend>Visibility</legend>
            {['public', 'private', 'restricted'].map((item) => <label key={item}><input type="radio" checked={form.visibility === item} onChange={() => update('visibility', item)} /> {item}</label>)}
          </fieldset>
          <fieldset>
            <legend>License</legend>
            {['open_access', 'copyright_reserved', 'creative_commons'].map((item) => <label key={item}><input type="radio" checked={form.license === item} onChange={() => update('license', item)} /> {item}</label>)}
          </fieldset>
          <label className="checkbox"><input type="checkbox" checked={form.declaration} onChange={(e) => update('declaration', e.target.checked)} /> I confirm this is my original work and I have rights to publish it.</label>
          <button disabled={!form.declaration} onClick={checkAndPreview}>Preview</button>
        </div>
      )}

      {step === 5 && (
        <div style={{ animation: 'fadeUp 0.4s ease' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--forest)', textAlign: 'center' }}>Preview & Validation</h2>
          {duplicate?.duplicate && <p className="warning" style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.8rem', textAlign: 'center', marginBottom: '1.5rem' }}>Duplicate title warning: a paper with this title already exists.</p>}
          <div className="glass-card" style={{ marginBottom: '2rem', overflowX: 'auto' }}>
            <pre className="summary" style={{ margin: 0, padding: 0, background: 'transparent', color: 'var(--ink)' }}>{JSON.stringify({ ...form, file: fileMeta.fileName }, null, 2)}</pre>
          </div>
          <div style={{ textAlign: 'center' }}>
            <button style={{ padding: '1rem 3rem', fontSize: '1.2rem' }} disabled={!form.title || !form.abstract || !form.year || !form.category_id || !form.declaration} onClick={submit}>Submit Paper</button>
          </div>
        </div>
      )}
    </section>
  );
}
