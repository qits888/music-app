# 新手GitHub完整操作指南

## 📋 前提准备

- ✅ 已有GitHub账号
- ✅ 项目代码已在本地准备好

## 🎯 第一步：在GitHub网站创建仓库

### 1.1 登录GitHub
1. 打开浏览器，访问 https://github.com
2. 点击右上角 **Sign in** 登录
3. 输入你的用户名和密码

### 1.2 创建新仓库
1. 登录后，点击右上角的 **+** 号
2. 选择 **New repository**（新建仓库）
3. 填写仓库信息：
   - **Repository name**（仓库名称）：填写 `music-app`（或其他你喜欢的名字，只能用英文、数字、横杠）
   - **Description**（描述，可选）：填写 `Music Player Web App`
   - **Public/Private**（公开/私有）：选择 **Public**（必须选公开，GitHub Actions才免费）
   - ⚠️ **重要**：不要勾选任何复选框（不要添加README、.gitignore、license）
4. 点击绿色按钮 **Create repository**（创建仓库）

### 1.3 复制仓库地址
创建完成后，你会看到一个页面，上面有你的仓库地址，类似：
```
https://github.com/你的用户名/music-app.git
```
**复制这个地址**，稍后会用到。

---

## 🔧 第二步：配置Git凭据（首次使用需要）

打开 **PowerShell**（不是CMD），执行以下命令：

### 2.1 配置用户名和邮箱
```powershell
# 配置你的GitHub用户名（替换为你的真实用户名）
git config --global user.name "你的GitHub用户名"

# 配置你的GitHub邮箱（替换为你注册GitHub时用的邮箱）
git config --global user.email "你的邮箱@example.com"
```

**示例：**
```powershell
git config --global user.name "zhangsan"
git config --global user.email "zhangsan@qq.com"
```

---

## 🚀 第三步：推送代码到GitHub

### 3.1 进入项目目录
在PowerShell中执行：
```powershell
cd "E:\项目\Music app"
```

### 3.2 关联远程仓库
```powershell
# 将下面的地址替换为你在第1.3步复制的地址
git remote add origin https://github.com/你的用户名/music-app.git
```

**示例：**
```powershell
git remote add origin https://github.com/zhangsan/music-app.git
```

### 3.3 推送代码
```powershell
git push -u origin master
```

### 3.4 输入GitHub凭据
第一次推送时会弹出登录窗口：

**方式A：使用浏览器登录（推荐）**
1. 会自动打开浏览器
2. 点击 **Authorize**（授权）按钮
3. 等待几秒，命令行会自动继续

**方式B：使用个人访问令牌（如果方式A不行）**
1. 访问 https://github.com/settings/tokens
2. 点击 **Generate new token** → **Generate new token (classic)**
3. 填写：
   - Note（备注）：填写 `music-app`
   - Expiration（过期时间）：选择 **No expiration**（永不过期）
   - 勾选 **repo**（整个repo区域的所有选项）
4. 滚动到底部，点击绿色按钮 **Generate token**
5. **重要**：复制显示的令牌（只显示一次，请妥善保存！）
6. 回到PowerShell，当提示输入密码时，粘贴这个令牌

### 3.5 等待上传完成
你会看到类似这样的输出：
```
Enumerating objects: 73, done.
Counting objects: 100% (73/73), done.
...
To https://github.com/你的用户名/music-app.git
 * [new branch]      master -> master
```

看到这个就说明成功了！🎉

---

## 📱 第四步：查看自动构建

### 4.1 访问Actions页面
1. 在浏览器中打开你的GitHub仓库页面
   ```
   https://github.com/你的用户名/music-app
   ```
2. 点击顶部的 **Actions** 标签

### 4.2 查看构建进度
1. 你会看到一个正在运行的工作流（黄色圆圈图标 🟡）
2. 点击工作流名称进入详情页
3. 等待5-10分钟，构建完成后会变成绿色对勾 ✅

### 4.3 可能遇到的情况
- **绿色对勾 ✅**：构建成功，可以下载APK
- **红色叉号 ❌**：构建失败，点击查看错误日志
- **黄色圆圈 🟡**：正在构建中，请耐心等待

---

## 📥 第五步：下载APK

### 5.1 进入构建详情
1. 在Actions页面，点击最新的成功构建（绿色对勾的那个）
2. 滚动到页面底部

### 5.2 下载产物
1. 在 **Artifacts** 区域，你会看到：
   - `app-debug` - 调试版APK
   - `app-release`（可能没有）- 发布版APK
2. 点击 `app-debug` 下载
3. 会下载一个 `app-debug.zip` 文件

### 5.3 解压APK
1. 找到下载的 `app-debug.zip` 文件
2. 右键点击 → **解压到当前文件夹**
3. 得到 `app-debug.apk` 文件

---

## 📲 第六步：安装到手机

### 6.1 传输APK到手机
**方式1：微信/QQ**
1. 在电脑上打开微信/QQ
2. 打开 **文件传输助手** 或给自己发消息
3. 将 `app-debug.apk` 发送过去
4. 在手机上打开微信/QQ，下载这个文件

**方式2：USB数据线**
1. 用数据线连接手机和电脑
2. 打开手机的文件管理器
3. 将 `app-debug.apk` 复制到手机的 **Download** 文件夹

**方式3：云盘**
1. 上传到百度网盘/阿里云盘
2. 在手机上下载

### 6.2 安装APK
1. 在手机上打开文件管理器
2. 找到 `app-debug.apk` 文件
3. 点击安装
4. 如果提示"禁止安装未知应用"：
   - 点击 **设置**
   - 允许该来源的应用安装
   - 返回继续安装
5. 安装完成后点击 **打开**

---

## 🔄 更新代码后如何重新构建

当你修改了代码，想要重新生成APK：

```powershell
# 1. 进入项目目录
cd "E:\项目\Music app"

# 2. 查看修改的文件
git status

# 3. 添加所有修改
git add -A

# 4. 提交修改（修改引号里的描述）
git commit -m "更新了播放器功能"

# 5. 推送到GitHub
git push
```

推送后，GitHub Actions会自动开始构建新版本！

---

## ❓ 常见问题

### Q1: 推送时提示"Permission denied"
**解决方法：**
- 检查远程仓库地址是否正确
- 确保使用了正确的GitHub用户名和密码/令牌
- 尝试使用个人访问令牌（见第3.4步方式B）

### Q2: Actions构建失败
**解决方法：**
1. 点击失败的工作流查看详细日志
2. 常见原因：
   - 文件路径问题 → 检查所有文件是否已提交
   - 权限问题 → 确保仓库是Public
   - 配置错误 → 检查`.github/workflows/android-build.yml`

### Q3: 手机提示"解析包错误"
**解决方法：**
- 确保下载的APK文件完整（文件大小正常）
- 检查手机Android版本（需要5.0或更高）
- 重新下载APK

### Q4: 推送后没有自动构建
**解决方法：**
- 确保仓库是Public（私有仓库Actions有限额）
- 检查`.github/workflows/android-build.yml`文件是否存在
- 手动触发：Actions页面 → 选择工作流 → Run workflow

### Q5: 忘记了个人访问令牌
**解决方法：**
- 重新生成一个新的令牌（见第3.4步方式B）
- 旧令牌会自动失效

---

## 📚 有用的链接

- GitHub官方帮助文档：https://docs.github.com/cn
- Git命令速查表：https://training.github.com/downloads/zh_CN/github-git-cheat-sheet/
- GitHub Actions文档：https://docs.github.com/cn/actions

---

## 🎉 恭喜！

如果你完成了所有步骤，现在你已经：
- ✅ 学会了使用GitHub托管代码
- ✅ 学会了使用GitHub Actions自动构建
- ✅ 成功构建了Android应用
- ✅ 在手机上安装了自己的应用

以后每次修改代码，只需要执行：
```powershell
git add -A
git commit -m "修改说明"
git push
```

就能自动构建新版本的APK了！

---

**需要帮助？** 把错误信息截图或复制给我，我会帮你解决！