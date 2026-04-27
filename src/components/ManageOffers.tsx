import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  ClipboardList,
  Briefcase,
  User,
  LogOut,
  Bell,
  Plus,
  MapPin,
  Clock,
  ChevronRight,
  Edit2,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Users
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from 'sonner';
import { ALGERIA_WILAYAS } from '../constants';

interface Skill {
  id: number;
  skillName: string;
}

interface Offer {
  id: number;
  title: string;
  description: string;
  willaya: string;
  type: 'ONLINE' | 'IN_PERSON';
  requiredSkills: Skill[];
  deadline?: string;
  applicationDeadline: string;
  internshipStartDate: string;
  internshipEndDate: string;
  maxParticipants: number;
}

const ManageOffers = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    willaya: '',
    internshipStartDate: '',
    internshipEndDate: '',
    applicationDeadline: '',
    type: 'IN_PERSON' as 'ONLINE' | 'IN_PERSON',
    skillIds: [] as number[],
    maxParticipants: 1,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [offersRes, skillsRes] = await Promise.all([
        axios.get('/api/offers/', { headers }),
        axios.get('/api/skills/', { headers }),
      ]);

      const data = Array.isArray(offersRes.data) ? offersRes.data : (offersRes.data?.offers || []);
      setOffers(data);
      setAllSkills(Array.isArray(skillsRes.data) ? skillsRes.data : (skillsRes.data?.skills || []));
    } catch (err) {
      console.error('Error fetching offers:', err);
      toast.error('Failed to load offers.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (offer: Offer | null = null) => {
    if (offer) {
      setEditingOffer(offer);
      setFormData({
        title: offer.title,
        description: offer.description,
        willaya: offer.willaya,
        internshipStartDate: offer.internshipStartDate || '',
        internshipEndDate: offer.internshipEndDate || '',
        applicationDeadline: offer.applicationDeadline || '',
        type: offer.type,
        skillIds: offer.requiredSkills.map((s) => s.id),
        maxParticipants: offer.maxParticipants || 1,
      });
    } else {
      setEditingOffer(null);
      setFormData({
        title: '',
        description: '',
        willaya: '',
        internshipStartDate: '',
        internshipEndDate: '',
        applicationDeadline: '',
        type: 'IN_PERSON',
        skillIds: [],
        maxParticipants: 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };

    // FIX: payload field names now match InternshipOfferSerializer
    const payload = {
      title: formData.title,
      description: formData.description,
      willaya: formData.willaya,
      internshipStartDate: formData.internshipStartDate,
      internshipEndDate: formData.internshipEndDate,
      applicationDeadline: formData.applicationDeadline,
      type: formData.type,
      skillIds: formData.skillIds.map(String),
      maxParticipants: formData.maxParticipants,
    };

    try {
      if (editingOffer) {
        await axios.put(`/api/offers/${editingOffer.id}/update/`, payload, { headers });
        toast.success('Offer updated successfully!');
      } else {
        await axios.post('/api/offers/create/', payload, { headers });
        toast.success('Offer published successfully!');
      }

      await fetchData();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving offer:', err.response?.data || err);
      const errMsg = err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Failed to save offer.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      await axios.delete(`/api/offers/${id}/delete/`, { headers });
      toast.success('Offer deleted.');
      setOffers((prev) => prev.filter((o) => o.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      toast.error('Failed to delete offer.');
    }
  };

  const toggleSkill = (skillId: number) => {
    setFormData((prev) => ({
      ...prev,
      skillIds: prev.skillIds.includes(skillId)
        ? prev.skillIds.filter((id) => id !== skillId)
        : [...prev.skillIds, skillId],
    }));
  };

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-navy-900 selection:bg-blue-600/10 selection:text-blue-600">
      <Toaster position="top-right" richColors />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-[#060D1F] text-white flex flex-col z-50 border-r border-white/5">
        <div className="p-10">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-3 h-3 rounded-full bg-blue-600 group-hover:scale-125 transition-transform duration-500"></div>
            <span className="font-bold text-2xl tracking-tighter">Stag<span className="text-blue-600">.io</span></span>
          </Link>
        </div>

        <nav className="flex-1 px-6 space-y-1.5">
          <div className="pb-4 px-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Main Menu</p>
          </div>
          <Link to="/company/dashboard" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />
            Dashboard
          </Link>
          <Link to="/company/applications" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <ClipboardList size={18} className="group-hover:scale-110 transition-transform" />
            Applications
          </Link>
          <Link to="/company/offers" className="flex items-center gap-4 px-4 py-3.5 bg-blue-600 rounded-2xl text-[13px] font-bold tracking-wide transition-all shadow-lg shadow-blue-600/20 group">
            <Briefcase size={18} className="group-hover:scale-110 transition-transform" />
            Manage Offers
          </Link>
          <div className="pt-8 pb-4 px-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Account</p>
          </div>
          <Link to="/company/profile" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <User size={18} className="group-hover:scale-110 transition-transform" />
            Company Profile
          </Link>
        </nav>

        <div className="p-8 border-t border-white/5">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border border-white/5"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 min-h-screen">
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-12 sticky top-0 z-40">
          <div>
            <h2 className="text-2xl font-display font-bold text-navy-900 tracking-tight">Manage Offers</h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 mt-1">Create and monitor your internship listings</p>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-navy-900 transition-all shadow-xl shadow-blue-600/20 flex items-center gap-3 active:scale-95"
            >
              <Plus size={18} />
              Create New Offer
            </button>
          </div>
        </header>

        <div className="p-12 space-y-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-64 bg-white rounded-[3rem] border border-gray-100 animate-pulse" />
              ))
            ) : offers.length === 0 ? (
              <div className="col-span-full bg-white p-20 rounded-[3rem] border border-gray-100 text-center border-dashed">
                <div className="w-20 h-20 bg-paper rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-navy-900/10">
                  <Briefcase size={40} />
                </div>
                <h4 className="text-xl font-display font-bold text-navy-900 mb-2">No offers published yet</h4>
                <p className="text-navy-900/40 font-medium max-w-xs mx-auto mb-8">Start by creating your first internship offer to attract top talent.</p>
                <button
                  onClick={() => handleOpenModal()}
                  className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-navy-900 transition-all shadow-xl shadow-blue-600/20"
                >
                  Create Offer
                </button>
              </div>
            ) : (
              offers.map((offer, i) => (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-premium transition-all group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-xl font-display font-bold text-navy-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">{offer.title}</h4>
                      <div className="flex flex-wrap gap-3">
                        <div className="px-3 py-1.5 bg-paper rounded-xl text-[9px] font-bold uppercase tracking-widest text-navy-900/40 flex items-center gap-2">
                          <MapPin size={12} />
                          {offer.willaya}
                        </div>
                        <div className="px-3 py-1.5 bg-blue-50 rounded-xl text-[9px] font-bold uppercase tracking-widest text-blue-600 border border-blue-100/30">
                          {offer.type}
                        </div>
                        {offer.maxParticipants > 0 && (
                          <div className="px-3 py-1.5 bg-paper rounded-xl text-[9px] font-bold uppercase tracking-widest text-navy-900/40 flex items-center gap-2">
                            <Users size={12} />
                            {offer.maxParticipants} spots
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(offer)}
                        className="p-3 bg-paper text-navy-900/40 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(offer.id)}
                        className="p-3 bg-paper text-navy-900/40 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {(offer.requiredSkills || []).map((skill) => (
                      <span key={skill.id} className="px-3 py-1.5 bg-paper rounded-lg text-[10px] font-bold text-navy-900/40 uppercase tracking-widest">
                        {skill.skillName}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-2.5 text-orange-500">
                      <Clock size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        Apply by: {offer.applicationDeadline || offer.deadline || '—'}
                      </span>
                    </div>
                  </div>

                  {/* Delete Confirmation Overlay */}
                  <AnimatePresence>
                    {deleteConfirm === offer.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center z-10"
                      >
                        <AlertCircle size={40} className="text-red-500 mb-4" />
                        <h4 className="text-lg font-display font-bold text-navy-900 mb-2">Delete this offer?</h4>
                        <p className="text-sm text-navy-900/40 font-medium mb-6">This action cannot be undone. All applications for this offer will be lost.</p>
                        <div className="flex gap-4 w-full max-w-xs">
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="flex-1 py-3 bg-paper text-navy-900 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(offer.id)}
                            className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                          >
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-10 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-2xl font-display font-bold text-navy-900 tracking-tight">
                    {editingOffer ? 'Edit Internship Offer' : 'Publish New Offer'}
                  </h3>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 mt-1">Fill in the details for your internship</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-paper rounded-2xl text-navy-900/40 hover:text-navy-900 transition-all">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-navy-900/30 ml-4">Offer Title</label>
                      <input
                        required
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. Frontend Developer Intern"
                        className="w-full bg-paper border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-navy-900/30 ml-4">Wilaya</label>
                        <select
                          required
                          value={formData.willaya}
                          onChange={(e) => setFormData({ ...formData, willaya: e.target.value })}
                          className="w-full bg-paper border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold text-[11px] uppercase tracking-widest text-navy-900 appearance-none cursor-pointer"
                        >
                          <option value="">Select Wilaya</option>
                          {ALGERIA_WILAYAS.map((w) => <option key={w} value={w}>{w}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-navy-900/30 ml-4">Type</label>
                        <div className="flex p-1 bg-paper rounded-2xl border border-gray-100">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'IN_PERSON' })}
                            className={`flex-1 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${formData.type === 'IN_PERSON' ? 'bg-white text-blue-600 shadow-sm' : 'text-navy-900/40'}`}
                          >
                            In Person
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'ONLINE' })}
                            className={`flex-1 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${formData.type === 'ONLINE' ? 'bg-white text-blue-600 shadow-sm' : 'text-navy-900/40'}`}
                          >
                            Online
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* FIX: updated to use internshipStartDate / internshipEndDate / applicationDeadline */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-navy-900/30 ml-4">Start Date</label>
                        <input
                          required
                          type="date"
                          value={formData.internshipStartDate}
                          onChange={(e) => setFormData({ ...formData, internshipStartDate: e.target.value })}
                          className="w-full bg-paper border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-navy-900/30 ml-4">End Date</label>
                        <input
                          required
                          type="date"
                          value={formData.internshipEndDate}
                          onChange={(e) => setFormData({ ...formData, internshipEndDate: e.target.value })}
                          className="w-full bg-paper border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-navy-900/30 ml-4">Application Deadline</label>
                        <input
                          required
                          type="date"
                          value={formData.applicationDeadline}
                          onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                          className="w-full bg-paper border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                        />
                      </div>
                      {/* FIX: added maxParticipants field */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-navy-900/30 ml-4">Max Participants</label>
                        <input
                          required
                          type="number"
                          min={1}
                          max={100}
                          value={formData.maxParticipants}
                          onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 1 })}
                          className="w-full bg-paper border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-navy-900/30 ml-4">Description</label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the internship role, responsibilities, and what you're looking for..."
                      rows={8}
                      className="w-full bg-paper border border-gray-100 rounded-3xl py-6 px-8 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900 resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-navy-900/30 ml-4">Required Skills</label>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">{formData.skillIds.length} selected</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allSkills.map((skill) => (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => toggleSkill(skill.id)}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                          formData.skillIds.includes(skill.id)
                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
                            : 'bg-paper text-navy-900/40 border-gray-100 hover:border-blue-600/30'
                        }`}
                      >
                        {skill.skillName}
                      </button>
                    ))}
                  </div>
                </div>
              </form>

              <div className="p-10 border-t border-gray-100 bg-paper/50 flex justify-end gap-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-4 bg-white text-navy-900 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-navy-900 transition-all shadow-xl shadow-blue-600/20 flex items-center gap-3 active:scale-95"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  {editingOffer ? 'Save Changes' : 'Publish Offer'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageOffers;
