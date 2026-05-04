import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Plus, X, Loader2, Download, 
  Trash2, FileType, Save
} from 'lucide-react';
import { OwnerLayout } from '../../components/Owner/OwnerLayout';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export default function MedicalRecords() {
  const { id } = useParams(); // This is the pet_id
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    record_type: 'Other',
    description: '',
    file: null
  });

  const recordTypes = [
    'Checkup', 'Vaccination', 'Surgery', 'Treatment', 'Lab Result', 'Prescription', 'Other'
  ];

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      const { data: petData, error: petError } = await supabase
        .from('pets')
        .select('*')
        .eq('id', id)
        .single();
      
      if (petError) throw petError;
      setPet(petData);

      const { data: recordsData, error: recordsError } = await supabase
        .from('medical_records')
        .select('*')
        .eq('pet_id', id)
        .order('created_at', { ascending: false });

      if (recordsError) throw recordsError;
      setRecords(recordsData || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to sync archive');
    } finally {
      setLoading(false);
    }
  };

  /**
   * UPDATED DELETE LOGIC
   * Focused on removing the row from the 'medical_records' table.
   */
  const handleDeleteRecord = async (record) => {
    const toastId = toast.loading('Removing record from registry...');
    try {
      setDeletingId(record.id);

      // 1. Delete the row from the database
      const { error: dbError } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', record.id);

      if (dbError) throw dbError;

      // 2. Update UI State immediately so the user sees it's gone
      setRecords(prev => prev.filter(r => r.id !== record.id));
      toast.success('Record deleted successfully', { id: toastId });

      // 3. Attempt to clean up storage (Optional background task)
      // We do this last and in a try/catch so if it fails, the UI is already updated
      try {
        const attachments = record.attachments;
        if (Array.isArray(attachments) && attachments.length > 0 && attachments[0].url) {
          const fileUrl = attachments[0].url;
          const storagePath = fileUrl.split('/medical_records/')[1];
          if (storagePath) {
            await supabase.storage.from('medical_records').remove([storagePath]);
          }
        }
      } catch (storageErr) {
        console.warn('File cleanup failed, but record row was deleted:', storageErr);
      }

    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete: ' + err.message, { id: toastId });
    } finally {
      setDeletingId(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== 'application/pdf') {
      toast.error('PDF files only');
      return;
    }
    setFormData({ ...formData, file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.file) {
      toast.error('Title and file are mandatory');
      return;
    }

    const toastId = toast.loading('Uploading clinical document...');
    try {
      setUploading(true);
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('medical_records')
        .upload(fileName, formData.file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('medical_records')
        .getPublicUrl(fileName);

      const attachments = [{
        url: publicUrl,
        name: formData.file.name,
        size: formData.file.size,
        type: formData.file.type
      }];

      const { error: insertError } = await supabase
        .from('medical_records')
        .insert([{
          pet_id: id,
          title: formData.title,
          record_type: formData.record_type,
          description: formData.description,
          attachments: attachments
        }]);

      if (insertError) throw insertError;

      toast.success('Record added to history', { id: toastId });
      setShowForm(false);
      setFormData({ title: '', record_type: 'Other', description: '', file: null });
      fetchData();
    } catch (err) {
      toast.error('Upload failed: ' + err.message, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <OwnerLayout title="Medical History">
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="animate-spin text-emerald-600 size-8" />
        <p className="text-zinc-500 text-sm font-medium animate-pulse">Syncing clinical archive...</p>
      </div>
    </OwnerLayout>
  );

  return (
    <OwnerLayout title="Medical Archive">
      <div className="max-w-[900px] mx-auto px-6 py-10 antialiased selection:bg-emerald-100">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <button 
              onClick={() => navigate(`/owner/pets/${id}`)}
              className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors mb-2"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Back to {pet?.name}</span>
            </button>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Health History</h1>
          </div>

          <button 
            onClick={() => setShowForm(!showForm)}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
              showForm ? 'bg-white border border-zinc-200 text-zinc-600' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200/50'
            }`}
          >
            {showForm ? <X size={14} /> : <Plus size={14} />} 
            {showForm ? 'Cancel Entry' : 'New Clinical Entry'}
          </button>
        </div>

        {/* Upload Form */}
        {showForm && (
          <div className="bg-white p-8 rounded-xl border border-zinc-200 shadow-xl mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Document Title</label>
                  <input 
                    type="text" required placeholder="e.g., Annual Vaccination"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Type</label>
                  <select
                    value={formData.record_type}
                    onChange={e => setFormData({...formData, record_type: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-black focus:border-emerald-500 outline-none appearance-none cursor-pointer"
                  >
                    {recordTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  rows={2} value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-black focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none"
                  placeholder="Record summary..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Clinical File (PDF)</label>
                <input 
                  type="file" accept=".pdf" required
                  onChange={handleFileChange}
                  className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-[11px] file:font-bold file:uppercase file:bg-zinc-900 file:text-white hover:file:bg-zinc-800 cursor-pointer border border-dashed border-zinc-200 p-6 rounded-xl bg-zinc-50/50"
                />
              </div>
              <div className="pt-4 flex justify-end">
                <button 
                  type="submit" disabled={uploading}
                  className="inline-flex items-center justify-center gap-2 px-10 py-2.5 bg-zinc-900 text-white font-semibold rounded-lg hover:bg-zinc-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Record
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List Card */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-emerald-600" />
              <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">Records Registry</h2>
            </div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{records.length} Item(s)</span>
          </div>
          
          {records.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center">
              <FileType size={32} className="text-zinc-200 mb-4" />
              <h3 className="text-sm font-semibold text-zinc-900">Archive empty</h3>
              <p className="text-xs text-zinc-400 mt-1">No medical documents found for this pet.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {records.map(record => (
                <div key={record.id} className="p-5 hover:bg-zinc-50/50 transition-colors group flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-zinc-900 text-sm truncate">{record.title}</h4>
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {record.record_type}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                      {new Date(record.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    {record.attachments?.[0]?.url && (
                      <a 
                        href={record.attachments[0].url} target="_blank" rel="noopener noreferrer"
                        className="p-2 text-zinc-400 hover:text-zinc-900 transition-all"
                        title="Download PDF"
                      >
                        <Download size={16} />
                      </a>
                    )}
                    <button 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to permanently delete this medical record?')) {
                          handleDeleteRecord(record);
                        }
                      }}
                      disabled={deletingId === record.id}
                      className="p-2 text-zinc-300 hover:text-red-600 transition-all"
                      title="Delete Record"
                    >
                      {deletingId === record.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </OwnerLayout>
  );
}