import { getPageBySlug } from "@/lib/actions/pages";
import { getPageLinks } from "@/lib/actions/links";
import { notFound } from "next/navigation";
import Image from "next/image";

export default async function PublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // Fetch the page by slug
  const pageResult = await getPageBySlug(slug);
  
  // If page not found or not published, show 404
  if (!pageResult.success || !pageResult.page || !pageResult.page.isPublished) {
    notFound();
  }
  
  const page = pageResult.page;
  
  // Fetch links for this page
  const linksResult = await getPageLinks(page.id, false); // Don't check ownership
  const links = linksResult.success && linksResult.links ? linksResult.links : [];
  
  // Default theme styling
  const themeStyles = {
    background: "bg-gradient-to-b from-indigo-100 to-blue-50",
    text: "text-gray-800",
    linkBg: "bg-indigo-50 hover:bg-indigo-100",
    linkBorder: "border-indigo-200",
    linkText: "text-indigo-700"
  };
  
  // Apply custom theme if specified
  switch (page.theme) {
    case "dark":
      themeStyles.background = "bg-gray-900";
      themeStyles.text = "text-white";
      themeStyles.linkBg = "bg-gray-800 hover:bg-gray-700";
      themeStyles.linkBorder = "border-gray-700";
      themeStyles.linkText = "text-white";
      break;
    case "minimal":
      themeStyles.background = "bg-white";
      themeStyles.text = "text-gray-900";
      themeStyles.linkBg = "bg-gray-50 hover:bg-gray-100";
      themeStyles.linkBorder = "border-gray-200";
      themeStyles.linkText = "text-gray-900";
      break;
    case "colorful":
      themeStyles.background = "bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100";
      themeStyles.text = "text-gray-900";
      themeStyles.linkBg = "bg-white/80 hover:bg-white";
      themeStyles.linkBorder = "border-purple-200";
      themeStyles.linkText = "text-purple-900";
      break;
    case "professional":
      themeStyles.background = "bg-gradient-to-b from-slate-50 to-slate-100";
      themeStyles.text = "text-slate-900";
      themeStyles.linkBg = "bg-white hover:bg-slate-50";
      themeStyles.linkBorder = "border-slate-200";
      themeStyles.linkText = "text-slate-900";
      break;
    default: // "default" theme
      themeStyles.background = "bg-gradient-to-b from-indigo-100 to-blue-50";
      themeStyles.text = "text-gray-800";
      themeStyles.linkBg = "bg-indigo-50 hover:bg-indigo-100";
      themeStyles.linkBorder = "border-indigo-200";
      themeStyles.linkText = "text-indigo-700";
  }
  
  // Find platform icon from the platform type
  const getPlatformIcon = (platform: string): string => {
    switch (platform) {
      case "linkedin": return "🔗";
      case "twitter": return "🐦";
      case "facebook": return "👤";
      case "instagram": return "📷";
      case "youtube": return "▶️";
      case "tiktok": return "🎵";
      case "github": return "💻";
      case "wechat": return "💬";
      case "weibo": return "🔴";
      case "zhihu": return "❓";
      case "xiaohongshu": return "📕";
      case "douyin": return "🎬";
      case "bilibili": return "📺";
      case "website": return "🌐";
      default: return "🔗";
    }
  };
  
  return (
    <div className="min-h-screen relative">
      {page.backgroundImage && (
        <div 
          className="fixed inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${page.backgroundImage})`,
            backgroundSize: page.backgroundImageFit === "cover" ? "cover" : 
                          page.backgroundImageFit === "contain" ? "contain" : 
                          "auto",
            backgroundPosition: page.backgroundImageFit === "cover" ? "center" : 
                             page.backgroundImageFit === "contain" ? "center" : 
                             "top left",
            backgroundRepeat: page.backgroundImageFit === "repeat" ? "repeat" : "no-repeat",
            zIndex: 0
          }}
        />
      )}
      <div className={`relative min-h-screen ${themeStyles.background} ${themeStyles.text} bg-opacity-80 backdrop-blur-sm`}>
        <div className="max-w-4xl mx-auto pt-16 pb-24 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            {page.mainIcon && (
              <div className="flex justify-center mb-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-white shadow-md border border-gray-200">
                  <Image 
                    src={page.mainIcon} 
                    alt={page.title}
                    fill
                    sizes="96px"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            )}
            
            <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
            
            {page.description && (
              <p className="text-xl opacity-80 max-w-2xl mx-auto">
                {page.description}
              </p>
            )}
          </div>
          
          {links.length > 0 && (
            <div className="grid gap-3 max-w-lg mx-auto">
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block p-4 ${themeStyles.linkBg} ${themeStyles.linkText} rounded-lg border ${themeStyles.linkBorder} transition-all transform hover:scale-102 hover:shadow-md`}
                >
                  <div className="flex items-center">
                    <div className="mr-3">
                      {link.customIcon ? (
                        <Image 
                          src={link.customIcon} 
                          alt={link.title}
                          width={24}
                          height={24}
                        />
                      ) : (
                        <span className="text-xl">{getPlatformIcon(link.platform)}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{link.title}</div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
          
          {links.length === 0 && (
            <div className="text-center py-8">
              <p className="text-lg opacity-70">No links added yet.</p>
            </div>
          )}
          
          {page.hasContactForm && (
            <div className="mt-12 max-w-lg mx-auto p-6 bg-white bg-opacity-80 rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">
                {page.contactFormTitle || "Contact Me"}
              </h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={4}
                    placeholder="Your message"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md font-medium"
                >
                  {page.contactFormCta || "Send Message"}
                </button>
              </form>
            </div>
          )}
          
          <div className="mt-16 text-center text-sm opacity-60">
            <p>© {page.title}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 