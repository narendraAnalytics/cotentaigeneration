"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Loader2, Plus, Trash2, Sparkles, Mail } from "lucide-react";
import { suggestBlogMetadata, EmailGenerationRequest } from "@/lib/api";

interface CreateEmailFormProps {
  onClose: () => void;
  onSubmit: (formData: EmailGenerationRequest) => void;
  isGenerating: boolean;
}

export default function CreateEmailForm({
  onClose,
  onSubmit,
  isGenerating,
}: CreateEmailFormProps) {
  const [topic, setTopic] = useState("");
  const [emailType, setEmailType] = useState<'marketing' | 'cold-outreach' | 'newsletter' | 'follow-up'>('marketing');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [tone, setTone] = useState<'professional' | 'casual' | 'formal' | 'friendly'>('professional');
  const [isSuggesting, setIsSuggesting] = useState(false);

  // NEW: Optional enhancement fields
  const [industry, setIndustry] = useState<'saas' | 'ecommerce' | 'healthcare' | 'realestate' | 'finance' | 'education' | 'general' | ''>('');
  const [emojiEnabled, setEmojiEnabled] = useState(false);

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleGenerateSuggestions = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic/purpose first");
      return;
    }

    try {
      setIsSuggesting(true);

      const suggestions = await suggestBlogMetadata(topic.trim());

      // Only fill empty fields (preserve user input)
      if (keywords.length === 0 && suggestions.keywords.length > 0) {
        setKeywords(suggestions.keywords);
      }

      if (!targetAudience.trim() && suggestions.targetAudience) {
        setTargetAudience(suggestions.targetAudience);
      }

      if (!additionalContext.trim() && suggestions.additionalContext) {
        setAdditionalContext(suggestions.additionalContext);
      }

      console.log("✅ Suggestions applied successfully");
    } catch (error) {
      console.error("Error generating suggestions:", error);
      alert("Failed to generate suggestions. Please try again.");
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!topic.trim() || keywords.length === 0) {
      alert("Please provide a topic/purpose and at least one keyword");
      return;
    }

    const formData: EmailGenerationRequest = {
      topic: topic.trim(),
      emailType,
      keywords,
      targetAudience: targetAudience.trim() || undefined,
      additionalContext: additionalContext.trim() || undefined,
      tone,
      // NEW: Include optional enhancement fields
      industry: industry || undefined,
      emojiEnabled,
    };

    onSubmit(formData);
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => !isGenerating && onClose()}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-linear-to-br from-purple-600 to-pink-600 rounded-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-linear-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Create New Email
                </h2>
                <p className="text-sm text-gray-600">
                  AI-powered email generation
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* AI Suggestions Button */}
            <motion.button
              type="button"
              onClick={handleGenerateSuggestions}
              disabled={isSuggesting || !topic.trim() || isGenerating}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-4 py-3 bg-linear-to-br from-purple-600 to-pink-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSuggesting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating AI Suggestions...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Get AI Suggestions
                </>
              )}
            </motion.button>

            {/* Topic/Purpose */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Topic/Purpose *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., New Product Launch Announcement"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-600 focus:outline-none transition-colors"
                disabled={isGenerating}
                required
              />
            </div>

            {/* Email Type */}
            <div>
              <label htmlFor="emailType" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Type *
              </label>
              <select
                id="emailType"
                value={emailType}
                onChange={(e) => setEmailType(e.target.value as any)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-600 focus:outline-none transition-colors"
                disabled={isGenerating}
                required
              >
                <option value="marketing">Marketing Campaign</option>
                <option value="cold-outreach">Cold Outreach</option>
                <option value="newsletter">Newsletter</option>
                <option value="follow-up">Follow-up</option>
              </select>
            </div>

            {/* Tone */}
            <div>
              <label htmlFor="tone" className="block text-sm font-semibold text-gray-700 mb-2">
                Tone *
              </label>
              <select
                id="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-600 focus:outline-none transition-colors"
                disabled={isGenerating}
                required
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
                <option value="friendly">Friendly</option>
              </select>
            </div>

            {/* NEW: Industry Selector (Optional) */}
            <div>
              <label htmlFor="industry" className="block text-sm font-semibold text-gray-700 mb-2">
                Industry (Optional)
              </label>
              <select
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value as any)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-600 focus:outline-none transition-colors"
                disabled={isGenerating}
              >
                <option value="">None - General Email</option>
                <option value="saas">SaaS / Tech</option>
                <option value="ecommerce">E-commerce / Retail</option>
                <option value="healthcare">Healthcare / Wellness</option>
                <option value="realestate">Real Estate</option>
                <option value="finance">Finance / Banking</option>
                <option value="education">Education / Training</option>
                <option value="general">General Business</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Select an industry for specialized language and tone
              </p>
            </div>

            {/* NEW: Emoji Toggle (Optional) */}
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
              <input
                type="checkbox"
                id="emojiEnabled"
                checked={emojiEnabled}
                onChange={(e) => setEmojiEnabled(e.target.checked)}
                disabled={isGenerating}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="emojiEnabled" className="flex-1">
                <div className="text-sm font-semibold text-gray-700">
                  Enable Emojis in Subject Line
                </div>
                <div className="text-xs text-gray-600">
                  Boost open rates with relevant emojis (1-2 per subject)
                </div>
              </label>
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Keywords *
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddKeyword();
                    }
                  }}
                  placeholder="Enter a keyword and press Enter"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-600 focus:outline-none transition-colors"
                  disabled={isGenerating}
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isGenerating}
                  aria-label="Add keyword"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Keyword Tags */}
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword) => (
                    <motion.div
                      key={keyword}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg flex items-center gap-2"
                    >
                      <span className="text-sm font-medium">{keyword}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(keyword)}
                        className="hover:bg-purple-200 rounded transition-colors p-1"
                        disabled={isGenerating}
                        aria-label={`Remove keyword ${keyword}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Target Audience
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g., Existing customers, B2B professionals"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-600 focus:outline-none transition-colors"
                disabled={isGenerating}
              />
            </div>

            {/* Additional Context */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Context
              </label>
              <textarea
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="Any specific points to include, special offers, deadlines, etc."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-600 focus:outline-none transition-colors resize-none"
                disabled={isGenerating}
              />
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isGenerating || !topic.trim() || keywords.length === 0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-4 bg-linear-to-br from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Generating Your Email...
                </>
              ) : (
                <>
                  <Mail className="w-6 h-6" />
                  Generate Email
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </>
  );
}
