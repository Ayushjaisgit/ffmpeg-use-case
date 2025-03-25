# 🎬 FFmpeg Media Processor (Node.js + Express)

This application demonstrates **FFmpeg-based media processing** using **Node.js & Express**.  
It allows:  
✅ **Overlaying a resized logo** on a video (top-right corner).  
✅ **Adding Headings** .  
✅ **Processing uploaded videos** and returning the modified output.  

---

## 🚀 Postman Curl for testing 

```sh
## Postman Curl for testing 
curl --location 'http://localhost:3000/process-media' \
--form 'media=@"Media Path' \
--form 'logo=@"Media Path"' \
--form 'heading="Nature is beautiful"'
