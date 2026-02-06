import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import PlaceholderState from "@/components/ui/PlaceholderState";
import { BookOpen, UploadCloud } from "lucide-react";

export default function KnowledgeBasePage() {
    return (
        <PageContainer>
            <PageHeader
                title="Knowledge Base"
                description="Upload documents or add links to train your AI."
            >
                <button className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
                    <UploadCloud className="w-4 h-4" />
                    Upload Sources
                </button>
            </PageHeader>

            <div className="grid grid-cols-1 gap-4">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-card-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors cursor-pointer">
                    <UploadCloud className="w-8 h-8 text-gray-500 mb-2" />
                    <p className="text-sm text-white font-medium">Click or drag files to upload</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOCX, TXT (Max 10MB)</p>
                </div>

                <h3 className="text-lg font-semibold text-white mt-6 mb-2">Active Sources (3)</h3>

                {[
                    { name: 'Product_Catalog_2025.pdf', size: '2.4 MB', type: 'PDF', date: 'Just now' },
                    { name: 'Company_Policy_v2.docx', size: '156 KB', type: 'DOCX', date: '2 hours ago' },
                    { name: 'https://webdevpro.com/pricing', size: 'Web Page', type: 'LINK', date: '1 day ago' }
                ].map((file, i) => (
                    <div key={i} className="dark-card p-4 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-medium text-white">{file.name}</div>
                                <div className="text-xs text-gray-500 flex gap-2">
                                    <span>{file.type}</span>
                                    <span>•</span>
                                    <span>{file.size}</span>
                                    <span>•</span>
                                    <span>{file.date}</span>
                                </div>
                            </div>
                        </div>
                        <button className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:underline">Remove</button>
                    </div>
                ))}
            </div>
        </PageContainer>
    );
}
