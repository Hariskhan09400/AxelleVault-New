import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Moon, Sun } from 'lucide-react';
import { useHubTheme } from '../hooks/useHubTheme';
import { blogPosts, readMinutes } from '../data/blogPosts';
import { SafeLink, useSafeNavigate } from '../lib/navigation';

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useSafeNavigate();
  const { isDark, toggle, theme } = useHubTheme();
  const post = blogPosts.find((p) => p.slug === slug);
  const more = blogPosts.filter((p) => p.slug !== slug).slice(0, 2);

  useEffect(() => window.scrollTo(0, 0), [slug]);

  const goBlog = () => navigate('/home', { state: { scrollTo: 'blog' } });

  return (
    <div className={`min-h-[100dvh] overflow-x-hidden ${theme.page}`}>
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md ${theme.nav}`}>
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3.5 pt-[max(0.875rem,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={goBlog}
            className="inline-flex touch-manipulation items-center gap-2 rounded-full py-2 pr-3 text-sm font-medium active:opacity-60"
          >
            <ArrowLeft className="h-4 w-4" />
            All posts
          </button>
          <button
            type="button"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggle}
            className={`flex h-10 w-10 touch-manipulation items-center justify-center rounded-full border transition duration-200 active:scale-90 ${theme.toggleBg}`}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 pb-20 pt-10 sm:pt-14">
        {!post ? (
          <div className="py-20 text-center">
            <h1 className="text-3xl font-black tracking-tight">Post not found</h1>
            <p className={`mt-3 text-base ${theme.muted}`}>This article does not exist or was moved.</p>
            <button
              type="button"
              onClick={goBlog}
              className={`mt-6 inline-flex touch-manipulation items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold ${theme.primaryBtn}`}
            >
              Back to blog
            </button>
          </div>
        ) : (
          <>
            <article>
              <span className="inline-flex rounded-full bg-[#e8b74a]/10 px-3 py-1 text-xs font-semibold text-[#e8b74a]">
                {post.category}
              </span>
              <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-4xl">{post.title}</h1>
              <p className={`mt-3 text-sm ${theme.muted}`}>
                {post.date} · {readMinutes(post)} min read
              </p>

              <div className="mt-8 space-y-5 text-[17px] leading-8 sm:text-lg sm:leading-8">
                {post.body.map((para, i) => (
                  <p key={i} className={i === post.body.length - 1 && post.body.length > 6 ? 'font-semibold' : ''}>
                    {para}
                  </p>
                ))}
              </div>
            </article>

            <section className={`mt-16 border-t pt-8 ${theme.divider}`}>
              <h2 className="text-lg font-bold">Keep reading</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {more.map((p) => (
                  <SafeLink
                    key={p.slug}
                    to={`/blog/${p.slug}`}
                    className={`group rounded-2xl border p-5 ${theme.card} ${theme.cardHover}`}
                  >
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-[#e8b74a]">
                      {p.category.toUpperCase()}
                    </span>
                    <p className="mt-2 flex items-start justify-between gap-2 text-base font-bold leading-snug">
                      {p.title}
                      <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-[#e8b74a]" />
                    </p>
                  </SafeLink>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default BlogPost;