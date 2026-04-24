import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 💡 取得目前檔案的路徑與目錄 (ESM 專用寫法)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 設定路徑 (使用絕對路徑最安全)
const inputFile = path.join(__dirname, 'gear_all.jpg');
const outputDir = path.join(__dirname, 'public', 'image', 'gear');

// 裝備類別定義
const categories = ['jersey', 'shorts', 'shoes', 'kneepad', 'wristband', 'headband'];

// 確保輸出目錄存在
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function splitImage() {
    try {
        const image = sharp(inputFile);
        const { width, height } = await image.metadata();

        const colCount = 6;
        const rowCount = 6;
        const itemWidth = Math.floor(width / colCount);
        const itemHeight = Math.floor(height / rowCount);

        console.log(`圖片尺寸: ${width}x${height}, 每格尺寸: ${itemWidth}x${itemHeight}`);

        for (let row = 0; row < rowCount; row++) {
            for (let col = 0; col < colCount; col++) {
                const category = categories[row];
                const index = col + 1;
                const outputFileName = `${category}_${index}.jpg`;
                const outputPath = path.join(outputDir, outputFileName);

                await image
                    .clone()
                    .extract({
                        left: col * itemWidth,
                        top: row * itemHeight,
                        width: itemWidth,
                        height: itemHeight,
                    })
                    .toFile(outputPath);

                console.log(`已生成: ${outputFileName}`);
            }
        }
        console.log('✅ 全部裁切完成！打開 public/image/gear 看看吧！');
    } catch (error) {
        console.error('❌ 裁切失敗，請確認 gear_all.jpg 是否和這個腳本放在同一個資料夾裡面:', error.message);
    }
}

splitImage();