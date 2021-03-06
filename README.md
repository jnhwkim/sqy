# NodeJs+Express+monogdb写的一个测试系统

> 上周答应帮一个远在韩国的读研同学写一个测试系统，要求测试人员回答两个问题，每题回答时间15分钟，有倒计时

### 两种测试类型

* 第一题必须答完9分钟，然后自动解锁第二题，关闭第一题，不可回到第一题
* 两题可以自动切换回答，每题解答时间9分钟，18分钟候自动提交并生成一个编号

### 我的话

第一次使用nodejs写项目，外加搭建vps，不熟。主要依赖网上的教程资源[用 Express 和 MongoDB 寫一個 todo list](http://dreamerslab.com/blog/tw/write-a-todo-list-with-express-and-mongodb/)

系统最后的样子跟这里的代码不一样，根据『项目经理/产品经理』（同学）的不断需求变更，在vps上直接修改，卡死。学了不少linux命令。事实证明，不断改需求不是产品经理的特有技能，任何人身体里都潜藏着，她还怪我被我的处女座特征传染了。。。

### 反思

* 忘记加.gitignore文件了，把.idea文件提上来了，当时太仓促了
* 当时在vps上启动完数据库服务和node服务之后，就关闭了终端，过了一段时间发现访问不了了，这才知道这世上还有一个命令叫`nohup`

```shell
# nohup ./mongod &
# nohup node app &
```
好了，这下没问题了，但是下次有需求改动，或者需要停服务的时候不知道怎么弄了，linux菜鸟的我至少求助网络资源---`kill`
```shell
# ps -ef | grep node
# kill -9 xxxxx
```

* 这是借助资源对nodejs的一次浅尝辄止，但是打开了我的nodejs之门，想好好学学nodejs的念头已经很久了，这次的实施对nodejs的基本知识懂了很多，待提升！
* 写文字感觉比写代码难很多，待提高！

### 放几张截图

* 开始界面

<img src="welcome.png" alt="开始界面" width="500px" />

* 实验一

<img src="test1.png" alt="实验一" width="500px" />

* 实验二

<img src="test2.png" alt="实验二" width="500px" />

----------------------
2014.11.14
