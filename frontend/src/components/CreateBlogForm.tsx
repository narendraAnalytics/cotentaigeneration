"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Loader2, Plus, Trash2, Sparkles } from "lucide-react";
import { suggestBlogMetadata } from "@/lib/api";

interface CreateBlogFormProps {
  onClose: () => void;
  onSubmit: (formData: BlogGenerationRequest, email?: string) => void;
  isGenerating: boolean;
}

export interface BlogGenerationRequest {
  topic: string;
  keywords: string[];
  targetAudience?: string;
  additionalContext?: string;
  options?: {
    tone: 'professional' | 'casual' | 'formal' | 'friendly' | 'authoritative' | 'conversational';
    style: 'informative' | 'persuasive' | 'educational' | 'storytelling' | 'technical' | 'creative';
    wordCount: number;
    sectionCount: number;
    includeIntro: boolean;
    includeConclusion: boolean;
    formatting: {
      useMarkdown: boolean;
      useHeadings: boolean;
    };
  };
}

export default function CreateBlogForm({
  onClose,
  onSubmit,
  isGenerating,
}: CreateBlogFormProps) {
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [email, setEmail] = useState("");
  const [tone, setTone] = useState("professional");
  const [style, setStyle] = useState("informative");
  const [wordCount, setWordCount] = useState(1000);
  const [sectionCount, setSectionCount] = useState(4);
  const [isSuggesting, setIsSuggesting] = useState(false);

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
      alert("Please enter a topic first");
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

      // Success feedback
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
      alert("Please provide a topic and at least one keyword");
      return;
    }

    const formData: BlogGenerationRequest = {
      topic: topic.trim(),
      keywords,
      targetAudience: targetAudience.trim() || undefined,
      additionalContext: additionalContext.trim() || undefined,
      options: {
        tone: tone as any,
        style: style as any,
        wordCount,
        sectionCount,
        includeIntro: true,
        includeConclusion: true,
        formatting: {
          useMarkdown: true,
          useHeadings: true,
        },
      },
    };

    // Pass email separately (not part of the API request)
    onSubmit(formData, email.trim() || undefined);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Create New Blog Post
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating || isSuggesting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Close form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Topic */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Topic <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., AI in Software Development"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                required
                disabled={isGenerating || isSuggesting}
              />
              <button
                type="button"
                onClick={handleGenerateSuggestions}
                disabled={isGenerating || isSuggesting || !topic.trim()}
                className="px-4 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold whitespace-nowrap"
                title="Generate AI suggestions for keywords, audience, and context"
              >
                {isSuggesting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Suggesting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Suggest
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Keywords <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddKeyword())}
                placeholder="Add keyword and press Enter"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                disabled={isGenerating || isSuggesting}
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                disabled={isGenerating || isSuggesting}
                className="px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
                aria-label="Add keyword"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(keyword)}
                    disabled={isGenerating || isSuggesting}
                    className="hover:text-purple-900 disabled:opacity-50"
                    aria-label={`Remove keyword ${keyword}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
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
              placeholder="e.g., Software developers and tech professionals"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              disabled={isGenerating || isSuggesting}
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
              placeholder="Provide any additional context or specific points to cover..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
              disabled={isGenerating || isSuggesting}
            />
          </div>

          {/* Email (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com - Get notified when blog is ready"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              disabled={isGenerating}
            />
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tone */}
            <div>
              <label htmlFor="tone-select" className="block text-sm font-semibold text-gray-700 mb-2">
                Tone
              </label>
              <select
                id="tone-select"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                disabled={isGenerating}
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="friendly">Friendly</option>
                <option value="formal">Formal</option>
                <option value="authoritative">Authoritative</option>
                <option value="conversational">Conversational</option>
              </select>
            </div>

            {/* Style */}
            <div>
              <label htmlFor="style-select" className="block text-sm font-semibold text-gray-700 mb-2">
                Style
              </label>
              <select
                id="style-select"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                disabled={isGenerating}
              >
                <option value="informative">Informative</option>
                <option value="persuasive">Persuasive</option>
                <option value="educational">Educational</option>
                <option value="storytelling">Storytelling</option>
                <option value="technical">Technical</option>
                <option value="creative">Creative</option>
              </select>
            </div>

            {/* Word Count */}
            <div>
              <label htmlFor="word-count" className="block text-sm font-semibold text-gray-700 mb-2">
                Word Count
              </label>
              <input
                id="word-count"
                type="number"
                value={wordCount}
                onChange={(e) => setWordCount(Number(e.target.value))}
                min={300}
                max={3000}
                step={100}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                disabled={isGenerating}
              />
            </div>

            {/* Section Count */}
            <div>
              <label htmlFor="section-count" className="block text-sm font-semibold text-gray-700 mb-2">
                Number of Sections
              </label>
              <input
                id="section-count"
                type="number"
                value={sectionCount}
                onChange={(e) => setSectionCount(Number(e.target.value))}
                min={2}
                max={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                disabled={isGenerating}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating || isSuggesting}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating || isSuggesting}
              className="flex-1 px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-semibold"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Blog Post"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
