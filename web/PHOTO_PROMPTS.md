# Sample photo prompts

Generate these in any image tool (ChatGPT / DALL-E, Midjourney, Gemini, Firefly...).
Settings: **4:3 landscape**, highest quality. Export as .webp or .jpg (~1200x900, under 250 KB).
Save as `public/photos/01.webp` ... `12.webp`, then list them in `lib/photos.ts`.

**Shared style, paste at the end of every prompt:**
> candid photobooth photo, shot on 35mm film, direct on-camera flash, deep cherry-red velvet curtain backdrop, warm skin tones, soft film grain, slight vignette, shallow depth of field, editorial Pinterest aesthetic, natural expressions, no text, no logos, no watermark

1. Two best friends in their early 20s, cheek to cheek, laughing mid-blink, one with a red hair bow.
2. Young woman with curly hair making a peace sign, playful smirk, silver hoop earrings.
3. A couple, she kisses his cheek while he looks surprised at the camera.
4. Three friends squeezed into frame, one sticking out her tongue, one with heart hands.
5. Woman in a cream knit sweater, eyes closed, holding a single red cherry by the stem near her lips.
6. Young man with round glasses and a vintage leather jacket, chin on fist, deadpan "thinking" pose.
7. Bride in a short white dress with a veil, laughing, holding a tiny bouquet, wedding-after-party vibe.
8. Two sisters in matching red lipstick, back to back, arms crossed, "too cool" pose.
9. Woman in her 30s with a pixie cut, blowing a kiss, gold necklace catching the flash.
10. Friends wearing party hats and tinsel, mid-scream excitement, confetti in the air.
11. A man and his grandmother, both wearing heart-shaped sunglasses, grinning.
12. Close-up of hands making a heart shape in front of a blurred smiling face.

Tips:
- Vary skin tones, ages and hair across the set. The wall should look like real, different people.
- Reject any image with warped hands, extra fingers or garbled text.
- These are **samples**. The site labels them as illustrative, never as real customers or reviews.

---

# Pose guide photos (16), gen-z edition

Paste this **once** at the start of a new ChatGPT conversation so every image shows the same model:

> I need 16 images for a photobooth pose guide that feels very Gen-Z and current. Use the SAME person in every image: a woman around 21 with dark brown hair in a messy claw-clip updo with face-framing strands, warm medium skin, glossy lips, small silver hoops and a thin chain necklace, wearing a fitted white baby tee. Every image: square 1:1, chest-up, centred, deep cherry-red velvet curtain backdrop, harsh direct on-camera flash (slightly overexposed, like a disposable camera or a 2000s digicam), candid energy, soft film grain. The pose must read instantly and hands must look natural with five fingers each. No text, no logos, no watermark. One image per message. I'll describe each pose.

Then send one line per message. Save each with the filename shown into `web/public/poses/`:

| File | Prompt |
|---|---|
| `fingerheart.webp` | Korean finger heart (thumb and index crossed) held next to her cheek, soft smile, head tilted. |
| `peaceeye.webp` | Peace sign held sideways over one eye, the eye looking through it, playful smirk, head tilted. |
| `squish.webp` | Both palms squishing her own cheeks together, tiny pout, wide eyes. |
| `unbothered.webp` | Chin resting on both fists, totally flat unimpressed stare straight into the lens, no smile. |
| `sideeye.webp` | Arms crossed, head turned slightly away, eyes sliding sideways to the camera, lips pressed: a dramatic side-eye. |
| `shades.webp` | Pulling small oval red sunglasses down her nose with one finger, eyebrow raised over the frames. |
| `caught.webp` | Caught mid-laugh, one hand covering her mouth, eyes squeezed shut, slight motion blur. |
| `you.webp` | Pointing straight at the camera lens with one finger, mock-serious face, finger slightly blurred and close. |
| `tooclose.webp` | Leaning way too close into the lens, wide-angle distortion, big nose, big eyes, laughing. |
| `hairflip.webp` | Flipping her hair mid-motion with a hand, strands flying, eyes locked on camera. |
| `pout.webp` | Soft glossy pout, eyes half closed, chin tucked down, unbothered model energy. |
| `selfie.webp` | Holding her phone up taking a selfie of herself in the booth, phone flash visible, looking at the screen. |
| `ew.webp` | Double thumbs down, nose scrunched, tongue slightly out: "ew, no". |
| `cherries.webp` | Hanging pairs of real cherries over both ears like earrings, sweet smile. |
| `maincharacter.webp` | Eyes closed, chin lifted, one hand resting on her collarbone, serene "main character" glow. |
| `doublepeace.webp` | Two peace signs up by her face, tongue out, one eye winking, chaotic Y2K energy. |

Tips: if one misses, reply "same person, but [fix]". Skip anything with extra or merged fingers.

---

# Booth doorway (1)

Save as `web/public/photos/booth-inside.webp`:

> Vertical 2:3 portrait photo looking straight into a small vintage photobooth. Inside, a stylish young woman sits on a small round chrome stool, legs crossed, smiling softly at the camera. The back wall is deep cherry-red velvet. Warm golden light pours down from above, making a soft spotlight on her and fading into darkness at the bottom. Cinematic, 35mm film, soft grain, editorial Pinterest aesthetic. Leave the left and right edges of the frame as plain dark red velvet (curtains will be layered over them). No text, no logos, no watermark.

## Optional: a real video for the home-page booth

The home page booth already animates using the sample photos. If you'd rather have real motion inside it, generate a short clip in a video generator that allows commercial use (check its terms), then:
1. Save it as `public/video/booth.mp4` (H.264, under 4 MB, 5–8 seconds, no audio, portrait 4:5).
2. In `lib/photos.ts` set `boothVideo = '/video/booth.mp4'`.

Prompt:
> Vertical 4:5 video, locked-off camera POV from inside a vintage photobooth. Two or three stylish Gen-Z friends squeeze onto the bench in front of a deep cherry-red velvet curtain, warm tungsten light from above. They do four quick poses in a row (finger hearts, cheek squish, peace signs, laughing), and a bright white camera flash pops between each pose. Natural, candid, joyful, slight film grain, 35mm photobooth look. No text, no logos, no watermark. Seamless loop, 6 seconds.
