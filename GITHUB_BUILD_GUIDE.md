# 使用GitHub Actions自动构建Android APK

本项目已配置GitHub Actions工作流，可以在云端自动构建APK，**无需在本地安装Android SDK或Android Studio**。

## 使用步骤

### 1. 将项目推送到GitHub

如果还没有将项目推送到GitHub，执行以下命令：

```powershell
# 初始化Git仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Add Android build configuration"

# 添加远程仓库（替换为你的GitHub仓库地址）
git remote add origin https://github.com/你的用户名/你的仓库名.git

# 推送到GitHub
git push -u origin main
```

如果你的默认分支是`master`而不是`main`，使用：
```powershell
git push -u origin master
```

### 2. 触发构建

GitHub Actions会在以下情况自动触发构建：
- 推送代码到`main`或`master`分支
- 创建Pull Request

你也可以手动触发构建：
1. 访问你的GitHub仓库
2. 点击顶部的 **Actions** 标签
3. 在左侧选择 **Build Android APK** 工作流
4. 点击右侧的 **Run workflow** 按钮
5. 选择分支，点击绿色的 **Run workflow** 按钮

### 3. 下载构建好的APK

构建完成后（通常需要5-10分钟）：

1. 在GitHub仓库的 **Actions** 页面
2. 点击最新的工作流运行记录
3. 滚动到页面底部的 **Artifacts** 区域
4. 下载 `app-debug.zip` 文件
5. 解压后得到 `app-debug.apk`

### 4. 安装APK到手机

将下载的APK文件传输到Android手机：
- 通过USB数据线
- 通过微信/QQ等聊天工具发送给自己
- 通过云盘分享

在手机上：
1. 打开文件管理器，找到APK文件
2. 点击安装
3. 如果提示"未知来源"，需要在设置中允许安装未知来源的应用

## 工作流说明

GitHub Actions工作流会自动：
1. ✅ 使用Ubuntu虚拟机（包含Android SDK）
2. ✅ 安装Java 11
3. ✅ 复制web资源到Android项目
4. ✅ 构建调试版APK（app-debug.apk）
5. ✅ 尝试构建发布版APK（需要签名配置）
6. ✅ 将APK作为artifact上传供下载

## 查看构建日志

如果构建失败：
1. 在Actions页面点击失败的工作流
2. 展开各个步骤查看详细日志
3. 根据错误信息修复问题

## 优势

✨ **完全免费** - GitHub Actions对公开仓库免费提供构建服务  
⚡ **无需本地工具** - 不需要安装Android Studio或Android SDK  
🔄 **自动化** - 每次推送代码自动构建  
☁️ **云端构建** - 利用GitHub服务器的资源  
📦 **随时下载** - 构建产物保存90天

## 本地构建（可选）

如果你以后想在本地构建，需要：
1. 安装Android Studio
2. 打开项目：`android/MusicApp`
3. 点击Run按钮

或使用命令行（需要Android SDK）：
```powershell
cd android/MusicApp
.\gradlew.bat assembleDebug
```

## 故障排除

### 问题：GitHub Actions构建失败
- 检查Actions日志查看具体错误
- 确保所有文件都已提交到仓库
- 检查`.github/workflows/android-build.yml`配置是否正确

### 问题：APK无法安装
- 确保手机允许安装未知来源应用
- 检查手机Android版本（需要5.0或更高）
- 尝试重新下载APK

### 问题：应用闪退
- 检查web资源是否完整复制到assets目录
- 查看Android logcat日志定位问题

## 下一步

如果需要发布到应用商店，需要配置签名：
1. 生成密钥库文件
2. 在GitHub仓库设置中添加密钥库密码作为Secrets
3. 修改工作流配置以使用签名构建

详细信息请参考 `android/ANDROID_BUILD.md`。