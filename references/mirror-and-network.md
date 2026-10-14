# 国内网络与镜像

`github.com` 在国内经常时通时断——具体表现是：`api.github.com` 通常可用，但 `github.com:443` 会间歇性被重置，于是 `git clone`、`git pull`、下载 release 包都可能失败。这个文件给出三条应对办法，以及维护者怎么建镜像。

## 一、三条应对办法

| 办法 | 适合谁 | 代价 |
| --- | --- | --- |
| **用镜像克隆**（推荐） | 所有用户 | 镜像需要维护者定期同步 |
| **走代理** | 有代理的用户 | 需要自己配 proxy，`git config --global http.proxy http://127.0.0.1:<端口>` |
| **下载 ZIP** | 临时用一次 | **不能自动更新**，每次要重新下载解压 |

用镜像克隆时，把 clone 地址换掉即可：

```bash
# 用镜像安装
git clone <镜像仓库地址> resume-polish
cd resume-polish && npm ci && npx playwright install chromium

# 已经用 GitHub 装过、想改成走镜像
git remote set-url origin <镜像仓库地址>
```

更新照旧一条命令：`python scripts/update_self.py`

## 二、去哪找镜像

**先看仓库 README 顶部有没有写镜像地址**——维护者建好镜像后会填在那里。

如果 README 里没有，说明还没建，可以：

1. 直接问维护者（开个 issue 或私下说一句）；
2. 自己建一个（下面第二节），顺手也能帮到别人。

国内常见的两个平台都支持「从外部仓库导入」：

- **AtomGit**（`atomgit.com`）：本项目参考的 ppt-master 就用了它——它的国内克隆走 atomgit.com，所以国内用户拉取从不失败；
- **Gitee**（`gitee.com`）：同样支持导入 GitHub 仓库。

## 三、怎么自建镜像（维护者视角）

### 方式 A：命令行镜像（最可靠，不依赖平台界面）

```bash
# 1. 在 AtomGit／Gitee 上新建一个空仓库，拿到它的地址，例如：
#    https://atomgit.com/<你的账号>/resume-polish.git

# 2. 把带完整历史的仓库镜像推上去（--mirror 会连分支、标签一起推）
git clone --bare https://github.com/Fanghj256/resume-polish.git resume-polish-mirror.git
cd resume-polish-mirror.git
git push --mirror https://atomgit.com/<你的账号>/resume-polish.git
cd .. && rm -rf resume-polish-mirror.git

# 3. 之后每次 GitHub 有了新提交，再镜像一次
git clone --bare https://github.com/Fanghj256/resume-polish.git tmp-mirror.git
git -C tmp-mirror.git push --mirror https://atomgit.com/<你的账号>/resume-polish.git
rm -rf tmp-mirror.git
```

### 方式 B：平台导入（更省事，界面步骤以平台当前界面为准）

AtomGit／Gitee 都有「新建仓库 → 导入外部仓库 → 填 GitHub 地址」的入口；导入后可在平台设置里找**定时同步**之类的选项，省掉手动 push。

### 建好之后要做的两件事

1. **把镜像地址写进 README 顶部**（用户第一眼就能看到），例如：
   `国内镜像（更新可能滞后）：https://atomgit.com/<账号>/resume-polish`
2. **给自己留一条镜像命令**，每次推完 GitHub 顺手镜像一次；LAG 太久的话，在 README 里注明"镜像可能滞后"。

## 四、给用户的一句话

> 克隆失败或 `git pull` 报 `Connection was reset` 时，不是仓库坏了，是网络到 `github.com` 被拦了。改用 README 里的镜像地址，或换个时间再试。
