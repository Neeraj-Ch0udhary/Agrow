import json, base64, io
from PIL import Image

# Load and resize screenshots
files = {
    'home':        'WhatsApp_Image_2026-05-17_at_2_10_50_AM__1_.jpeg',
    'mandi':       'WhatsApp_Image_2026-05-17_at_2_10_49_AM__2_.jpeg',
    'checklist':   'WhatsApp_Image_2026-05-17_at_2_10_50_AM.jpeg',
    'marketplace': 'WhatsApp_Image_2026-05-17_at_2_10_49_AM__1_.jpeg',
    'crop_detail': 'WhatsApp_Image_2026-05-17_at_2_10_48_AM__2_.jpeg',
    'calculator':  'WhatsApp_Image_2026-05-17_at_2_10_48_AM__3_.jpeg',
    'ai_chat':     'WhatsApp_Image_2026-05-17_at_2_10_47_AM.jpeg',
    'profile':     'WhatsApp_Image_2026-05-17_at_2_10_49_AM.jpeg',
}

imgs = {}
for name, fname in files.items():
    img = Image.open(fname)
    img.thumbnail((360, 720), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format='JPEG', quality=72)
    imgs[name] = f"data:image/jpeg;base64,{base64.b64encode(buf.getvalue()).decode()}"
    print(f"Processed {name}")

with open('index.html') as f:
    html = f.read()

# 1. APK button
html = html.replace(
    '<a href="https://github.com/neerajchoudhary/agrow" class="btn-primary">\n        📱 View on GitHub\n      </a>\n      <a href="mailto:neeraj89303@gmail.com" class="btn-secondary">\n        Partner with Us\n      </a>',
    '''<a href="https://expo.dev/accounts/neeraj-ch0udhary/projects/Agrow/builds/011a71f9-0616-4504-9696-808f7e7f60c9" class="btn-primary" target="_blank">📱 Download APK</a>
      <a href="https://github.com/Neeraj-Ch0udhary/Agrow" class="btn-secondary" target="_blank">⭐ GitHub</a>'''
)

# 2. Fix all GitHub links
html = html.replace('href="https://github.com/neerajchoudhary/agrow"', 'href="https://github.com/Neeraj-Ch0udhary/Agrow"')

# 3. Update crops count in sub
html = html.replace('6+ modern crops', '16 modern crops')

# 4. Add screenshots before crops
ss = f"""<!-- SCREENSHOTS -->
<section class="section screenshots-section" id="screenshots">
  <div class="section-inner">
    <div class="reveal">
      <div class="section-tag">App Screenshots</div>
      <h2 class="section-title">See Agrow in action —<br>built for real farmers</h2>
      <p class="section-sub">Every screen designed for simplicity. Works on any Android phone.</p>
    </div>
    <div class="screenshots-grid">
      <div class="screenshot-item reveal reveal-delay-1"><img src="{imgs['home']}" alt="Home" class="screenshot-img" loading="lazy" /><div class="screenshot-label">🏠 Home Dashboard</div><div class="screenshot-desc">Live weather, crop progress & quick access</div></div>
      <div class="screenshot-item reveal reveal-delay-2"><img src="{imgs['mandi']}" alt="Mandi" class="screenshot-img" loading="lazy" /><div class="screenshot-label">📈 Live Mandi Prices</div><div class="screenshot-desc">Real-time prices from 3,000+ mandis</div></div>
      <div class="screenshot-item reveal reveal-delay-3"><img src="{imgs['checklist']}" alt="Checklist" class="screenshot-img" loading="lazy" /><div class="screenshot-label">✅ Daily Checklist</div><div class="screenshot-desc">Auto-generated tasks per crop stage</div></div>
      <div class="screenshot-item reveal reveal-delay-4"><img src="{imgs['marketplace']}" alt="Market" class="screenshot-img" loading="lazy" /><div class="screenshot-label">🏪 Marketplace</div><div class="screenshot-desc">Post harvest, connect with buyers</div></div>
      <div class="screenshot-item reveal reveal-delay-1"><img src="{imgs['crop_detail']}" alt="Crop" class="screenshot-img" loading="lazy" /><div class="screenshot-label">🍄 Crop Detail Guide</div><div class="screenshot-desc">Steps, profit breakdown & buyer list</div></div>
      <div class="screenshot-item reveal reveal-delay-2"><img src="{imgs['calculator']}" alt="Calc" class="screenshot-img" loading="lazy" /><div class="screenshot-label">💰 Profit Calculator</div><div class="screenshot-desc">Visual profit breakdown per crop</div></div>
      <div class="screenshot-item reveal reveal-delay-3"><img src="{imgs['ai_chat']}" alt="AI" class="screenshot-img" loading="lazy" /><div class="screenshot-label">🤖 Agrow AI Chat</div><div class="screenshot-desc">Farming questions in Hindi or English</div></div>
      <div class="screenshot-item reveal reveal-delay-4"><img src="{imgs['profile']}" alt="Profile" class="screenshot-img" loading="lazy" /><div class="screenshot-label">👤 Farmer Profile</div><div class="screenshot-desc">Active crop, days farming & earnings</div></div>
    </div>
  </div>
</section>"""

html = html.replace('<!-- CROPS -->', ss + '\n\n<!-- CROPS -->')

with open('index.html', 'w') as f:
    f.write(html)

print(f"Done! File: {len(html)//1024} KB")