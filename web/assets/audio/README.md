# 音频资源目录

这个目录用于存放内置的音乐文件、封面图片和歌词文件。

## 目录结构

```
assets/audio/
├── song1.mp3          # 歌曲1音频文件
├── song2.mp3          # 歌曲2音频文件
├── song3.mp3          # 歌曲3音频文件
├── cover1.jpg         # 歌曲1封面图片
├── cover2.jpg         # 歌曲2封面图片
├── cover3.jpg         # 歌曲3封面图片
└── README.md          # 本说明文件
```

## 如何添加歌曲

### 1. 准备文件

将你的音频文件、封面图片放到这个目录下：
- **音频格式**：MP3、WAV、OGG、M4A等浏览器支持的格式
- **封面格式**：JPG、PNG、WebP等图片格式
- **建议封面尺寸**：500x500 或更大的正方形图片

### 2. 修改歌曲配置

打开 `web/scripts/data/tracks.js` 文件，添加歌曲信息：

```javascript
{
    id: 'track-4',                          // 唯一ID
    title: '歌曲名称',                       // 歌曲标题
    artist: '艺术家',                        // 艺术家名称
    album: '专辑名称',                       // 专辑名称（可选）
    src: 'assets/audio/你的歌曲.mp3',        // 音频文件路径
    cover: 'assets/audio/你的封面.jpg',      // 封面图片路径（可选）
    lyrics: `[00:00.00]歌词内容...`          // LRC格式歌词（可选）
}
```

### 3. 歌词格式（可选）

如果需要显示歌词，使用LRC格式：

```
[00:00.00]第一行歌词
[00:03.50]第二行歌词
[00:08.20]第三行歌词
```

时间格式：`[分:秒.毫秒]`

## 示例文件

由于版权原因，项目中不包含真实音频文件。你需要：

1. 准备你自己的音频文件
2. 将文件复制到这个目录
3. 更新 `tracks.js` 中的配置

## 在线音频（临时测试）

如果暂时没有本地文件，可以使用在线URL：

```javascript
{
    id: 'online-1',
    title: '在线测试',
    artist: '测试',
    src: 'https://example.com/your-audio.mp3',  // 使用在线URL
    cover: 'https://example.com/cover.jpg'
}
```

**注意**：在线URL需要支持CORS跨域访问。

## 推荐的免费音乐资源

- [Free Music Archive](https://freemusicarchive.org/)
- [Incompetech](https://incompetech.com/music/)
- [Bensound](https://www.bensound.com/)
- [YouTube Audio Library](https://www.youtube.com/audiolibrary)

请确保遵守音乐的版权许可。