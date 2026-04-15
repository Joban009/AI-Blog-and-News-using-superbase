// AdminCreatePost.jsx
import PostForm from '../../components/admin/PostForm';

export default function AdminCreatePost() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-ink-900">New Post</h1>
        <p className="font-sans text-sm text-ink-500 mt-0.5">Create manually or generate with Gemini AI</p>
      </div>
      <PostForm />
    </div>
  );
}
