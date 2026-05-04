import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Upload, Plus, X, Loader2, Download, Calendar
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

      // Fetch pet
      const { data: petData, error: petError } = await supabase
        .from(TABLES.PETS)
        .select('*')
        .eq('id', id)
        .single();
      
      if (petError) throw petError;
      setPet(petData);

      // Fetch records
      const { data: recordsData, error: recordsError } = await supabase
        .from(TABLES.MEDICAL_RECORDS)
        .select('*')
        .eq('pet_id', id)
        .order('created_at', { ascending: false });

      if (recordsError) throw recordsError;
      setRecords(recordsData || []);
    } catch (err) {
      toast.error('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }
    setFormData({ ...formData, file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.file) {
      toast.error('Title and file are required');
      return;
    }

    try {
      setUploading(true);
      
      // Upload file to Supabase Storage
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('medical_records')
        .upload(fileName, formData.file);

      if (uploadError) {
        throw new Error('Please make sure you have created the "medical_records" storage bucket. ' + uploadError.message);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('medical_records')
        .getPublicUrl(fileName);

      // Insert record
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

      toast.success('Medical record uploaded successfully');
      setShowForm(false);
      setFormData({ title: '', record_type: 'Other', description: '', file: null });
      fetchData();
      
    } catch (err) {
      toast.error(err.message || 'Failed to upload record');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <OwnerLayout title="Medical Records">
        <div className="flex justify-center py-32"><Loader2 className="animate-spin text-[#2BB673]" size={32} /></div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title={`Medical Records - ${pet?.name || 'Pet'}`}>
      <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center">
          <button 
            onClick={() => navigate(`/owner/pets/${id}`)}
            className="flex items-center gap-2 text-sm font-medium text-[#5F6368] hover:text-[#2BB673] transition-colors"
          >
            <ArrowLeft size={16} /> Back to {pet?.name}&apos;s Profile
          </button>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2BB673] text-white text-sm font-bold rounded-xl hover:bg-[#228B22] transition-colors shadow-sm"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />} 
            {showForm ? 'Cancel' : 'Upload Record'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-sm animate-in fade-in slide-in-from-top-4">
            <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
              <Upload size={20} className="text-[#2BB673]" /> Upload Medical PDF
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-black">Record Title *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g., Annual Checkup Results"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2BB673]/20 focus:border-[#2BB673] text-black"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-black">Record Type</label>
                  <select
                    value={formData.record_type}
                    onChange={e => setFormData({...formData, record_type: e.target.value})}
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2BB673]/20 focus:border-[#2BB673] bg-white text-black"
                  >
                    {recordTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-black">Description / Notes</label>
                <textarea 
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2BB673]/20 focus:border-[#2BB673] text-black"
                  placeholder="Optional notes about this record..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-black">PDF File *</label>
                <input 
                  type="file" 
                  accept=".pdf"
                  required
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-xl focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#E8F5E9] file:text-[#2BB673] hover:file:bg-[#C8E6C9] cursor-pointer"
                />
                <p className="text-xs text-[#5F6368]">Only PDF files are supported.</p>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="w-full flex justify-center items-center gap-2 py-3 bg-[#202124] text-white font-bold rounded-xl hover:bg-[#3C4043] transition-colors disabled:opacity-50"
                >
                  {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                  {uploading ? 'Uploading...' : 'Upload Record'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#F1F3F4]">
            <h2 className="text-xl font-bold text-black flex items-center gap-2">
              <FileText className="text-[#2BB673]" /> Medical History
            </h2>
          </div>
          
          {records.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-[#F8FAFC] rounded-full flex items-center justify-center mb-4">
                <FileText size={32} className="text-[#9CA3AF]" />
              </div>
              <h3 className="text-lg font-bold text-black mb-2">No records found</h3>
              <p className="text-[#5F6368] text-sm">Upload your first medical record for {pet?.name || 'this pet'} to keep their medical history organized.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F1F3F4]">
              {records.map(record => (
                <div key={record.id} className="p-6 hover:bg-[#F8FAFC] transition-colors flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-black">{record.title}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#E8F5E9] text-[#2BB673]">
                        {record.record_type}
                      </span>
                    </div>
                    {record.description && (
                      <p className="text-sm text-[#5F6368]">{record.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-[#9CA3AF] pt-1">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(record.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {record.attachments && record.attachments.length > 0 && (
                    <a 
                      href={record.attachments[0].url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="shrink-0 flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] text-sm font-bold text-black rounded-xl hover:bg-[#F1F3F4] transition-colors"
                    >
                      <Download size={16} className="text-[#2BB673]" /> View PDF
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </OwnerLayout>
  );
}