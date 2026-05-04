import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Plus, X, Loader2, Download, Calendar,
  Trash2, ShieldAlert, FileType, ChevronRight, Save
} from 'lucide-react';
import { OwnerLayout } from '../../components/Owner/OwnerLayout';
import { supabase, TABLES } from '../../lib/supabase';
import { toast } from 'sonner';

export default function MedicalRecords() {
  const { id } = useParams();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      const { data: petData, error: petError } = await supabase
        .from(TABLES.PETS)
        .select('*')
        .eq('id', id)
        .single();
      
      if (petError) throw petError;
      setPet(petData);

      const { data: recordsData, error: recordsError } = await supabase
        .from(TABLES.MEDICAL_RECORDS)
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

  // FULL DELETE LOGIC: Removes file from storage and row from table
  const handleDeleteRecord = async (record) => {
    const toastId = toast.loading('Removing clinical record...');
    try {
      setDeletingId(record.id);

      // 1. Delete the row from medical_records table FIRST
      const { error: dbError } = await supabase
        .from(TABLES.MEDICAL_RECORDS)
        .delete()
        .eq('id', record.id);

      if (dbError) throw dbError;

      // 2. Remove from Storage
      let attachments = record.attachments;
      if (typeof attachments === 'string') {
        try { attachments = JSON.parse(attachments); } catch(e) { attachments = []; }
      }
      
      if (Array.isArray(attachments) && attachments.length > 0 && attachments[0].url) {
        const fileUrl = attachments[0].url;
        // Extracts "PET_ID/filename.pdf" from the public URL
        const urlParts = fileUrl.split('/medical_records/');
        if (urlParts.length > 1) {
          const storagePath = urlParts[1];
          await supabase.storage
            .from('medical_records')
            .remove([storagePath]);
        }
      }

      toast.success('Record permanently deleted', { id: toastId });
      
      // Update UI
      setRecords(prev => prev.filter(r => r.id !== record.id));
    } catch (err) {
      console.error(err);
      toast.error('Deletion protocol failed', { id: toastId });
    } finally {
      setDeletingId(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== 'application/pdf') {
      toast.error('Clinical standards require PDF format');
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
        name: formData.file.name,
        url: publicUrl,
        type: formData.file.type,
        size: formData.file.size
      }];

      const { error: insertError } = await supabase
        .from(TABLES.MEDICAL_RECORDS)
        .insert([{
          pet_id: id,
          title: formData.title,
          record_type: formData.record_type,
          description: formData.description,
          attachments: attachments
        }]);

      if (insertError) throw insertError;

      toast.success('Record indexed successfully', { id: toastId });
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
        
        {/* Breadcrumb & Control Header */}
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
              showForm 
                ? 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200/50'
            }`}
          >
            {showForm ? <X size={14} /> : <Plus size={14} />} 
            {showForm ? 'Cancel Entry' : 'New Clinical Entry'}
          </button>
        </div>

        {/* Upload Form - Clean SaaS Style */}
        {showForm && (
          <div className="bg-white p-8 rounded-xl border border-zinc-200 shadow-xl shadow-zinc-200/20 mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 mb-8 px-2 border-l-2 border-emerald-500">
               <h3 className="font-semibold text-zinc-900 tracking-tight">Register Medical Document</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Title</label>
                  <input 
                    type="text" required placeholder="e.g. Vaccination Report"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-zinc-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Type</label>
                  <div className="relative">
                    <select
                        value={formData.record_type}
                        onChange={e => setFormData({...formData, record_type: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-black focus:border-emerald-500 outline-none appearance-none cursor-pointer"
                    >
                        {recordTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-zinc-300 pointer-events-none" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Medical Description</label>
                <textarea 
                  rows={2} value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-black focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none placeholder:text-zinc-400"
                  placeholder="Summary of findings or instructions..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">PDF Document</label>
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
                  Complete Upload
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List of Records */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-emerald-600" />
              <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">Records Registry</h2>
            </div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{records.length} items</span>
          </div>
          
          {records.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center">
              <div className="size-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4 border border-zinc-100">
                <FileType size={32} className="text-zinc-200" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">Archive empty</h3>
              <p className="text-xs text-zinc-400 mt-1">No medical history has been indexed for this patient.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {records.map(record => (
                <div key={record.id} className="p-5 hover:bg-zinc-50/50 transition-colors group flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-zinc-900 text-sm truncate">{record.title}</h4>
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {record.record_type}
                      </span>
                    </div>
                    {record.description && (
                      <p className="text-xs text-zinc-500 line-clamp-1 mb-2 font-medium">{record.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase text-zinc-400 tracking-tighter leading-none pt-1">
                      <div className="flex items-center gap-1"><Calendar size={12} className="text-zinc-300" /> {new Date(record.created_at).toLocaleDateString()}</div>
                      <span className="size-1 bg-zinc-200 rounded-full" />
                      <div className="flex items-center gap-1 font-mono text-zinc-500">ID: {record.id.slice(0, 8)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    {record.attachments?.[0]?.url && (
                      <a 
                        href={record.attachments[0].url} target="_blank" rel="noopener noreferrer"
                        className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-white rounded-lg border border-transparent hover:border-zinc-200 transition-all"
                        title="Download PDF"
                      >
                        <Download size={16} />
                      </a>
                    )}
                    <button 
                      onClick={() => {
                        if (window.confirm('Delete this record and its associated file permanently?')) {
                          handleDeleteRecord(record);
                        }
                      }}
                      disabled={deletingId === record.id}
                      className="p-2 text-zinc-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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

        {/* Security Info */}
        <div className="mt-8 flex items-center justify-center gap-3 text-zinc-400">
           <ShieldAlert size={14} />
           <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Patient Records are encrypted</span>
        </div>

      </div>
    </OwnerLayout>
  );
}