<template>
  <div class="login-wrap">
    <div class="login-form-wrap">
      <div class="login-head">
        <img src="./logo_index.png" alt="黑马头条号">
      </div>
      <div class="login-form">
        <!--
          表单验证：
          rules：配置验证规则 将需要验证的字段通过 prop 属性配置到el-form-item上
          ref：获取表单组件，可以手动调用表单组件的验证方法
         -->
        <el-form ref="form" :model="form" :rules="rules">
          <el-form-item prop="mobile">
            <el-input v-model="form.mobile" placeholder="请输入手机号哦"></el-input>
          </el-form-item>
          <el-form-item prop="code">
          <!-- 支持栅格布局，一共24列 -->
            <el-col :span="13">
              <el-input v-model="form.code" placeholder="请输入验证码"></el-input>
            </el-col>
            <el-col :span="7" :offset="2">
              <!-- <el-button @click="handleSendcode">获取验证码</el-button> -->
              <el-button
              @click="handleSendcode"
              :disabled="!!codeTime || codeLoading">
                {{ codeTime ? `剩余${codeSeconds}秒` : `获取验证码` }}
              </el-button>

            </el-col>
          </el-form-item>
          <el-form-item prop="checked">
            <el-checkbox v-model="form.checked"></el-checkbox>
            <span>我已阅读并同意<a href="#">用户协议</a>和<a href="#">服务条款</a></span>
          </el-form-item>
          <el-form-item>
            <!-- 给组件加class  会作用到它的根元素 -->
            <el-button class="btn-login"
            type="primary"
            @click="handleLogin"
            :loading="loginLoading">登录</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import '@/vendor/gt'
const djs = 60
export default {
  name: 'AppLogin',
  data () {
    return {
      form: {
        mobile: '13911111111',
        code: '246810',
        checked: ''
      },
      loginLoading: false,
      rules: {
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { len: 11, message: '11位手机号', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { len: 6, message: '6位验证码', trigger: 'blur' }
        ],
        checked: [
          { required: true, message: '请勾选', trigger: 'blur' },
          { pattern: /true/, message: '请勾选', trigger: 'change' }
        ]
      },
      captchaObj: null, // 通过 initGeetest 得到的极验验证码对象  用于下面的if判断
      codeSeconds: djs, // 倒计时时间
      codeTime: null, // 倒计时定时器
      sendMobile: '', // 保存初始化后发送的手机号
      codeLoading: false
    }
  },
  methods: {
    handleLogin () {
      // 表单组件有一个方法 validate keyi 用于获取当前表单的验证状态
      this.$refs['form'].validate(valid => {
        if (!valid) {
          return
        }
        // 表单验证通过， 提交
        this.submitlogin()
      })
    },

    submitlogin () {
      this.loginLoading = true
      this.$http({
        method: 'POST',
        url: '/authorizations',
        data: this.form
      }).then(data => { // 大于等于200 && 小于等于400 的状态码都会进入这里
        // 登录成功，将接口返回的用户信息数据放到本地存储
        window.localStorage.setItem('user_info', JSON.stringify(data))

        // element 消息提示组件
        this.$message({
          message: '登录成功了呢',
          type: 'success'
        })
        this.loginLoading = false
        // 建议路由跳转都使用name去跳转，可以方便进行路由传参
        this.$router.push({
          name: 'home'
        })
      })
        .catch(err => { // 大于等于400的状态码都会进入catch中
          if (err.response.status === 400) {
            this.$message.error('登录失败，手机号或验证码错误')
          }
          this.loginLoading = false
        })
    },

    showGeetest () {
      if (this.captchaObj) {
        return this.captchaObj.verify()// 有 captchaObj 的话直接弹出验证码
      }

      // 初始化验证码期间，禁用按钮的点击状态
      this.codeLoading = true

      this.$http({
        method: 'GET',
        url: `/captchas/${this.form.mobile}`
      }).then(data => {
        // const data = res.data.data  响应拦截器中统一处理了 不用再单独获取了
        window.initGeetest({ // 解决报错  加上window前缀
          // 以下配置参数来自服务端 SDK
          gt: data.gt,
          challenge: data.challenge,
          offline: !data.success,
          new_captcha: data.new_captcha,
          product: 'bind' // 影藏按钮式（极验文档）
        }, captchaObj => {
          this.captchaObj = captchaObj// 给captchaObj赋值  为了解决重复创建验证码弹框的问题
          // 这里可以调用验证实例 captchaObj 的实例方法
          captchaObj.onReady(() => {
            // ready以后才可以显示验证码
            this.sendMobile = this.form.mobile
            captchaObj.verify()// 显示验证码
            // 验证码初始化好了，让 “获取验证码” 按钮可点击
            this.codeLoading = false
          }).onSuccess(() => { // 二次验证 拖动滑块人机交互 （文档）
            // console.log('验证通过')
            const {
              geetest_challenge: challenge,
              geetest_seccode: seccode,
              geetest_validate: validate } = captchaObj.getValidate()
            this.$http({
              method: 'GET',
              url: `/sms/codes/${this.form.mobile}`,
              params: {// 用来传递query查询字符串参数
                challenge,
                seccode,
                validate
              }
            }).then(data => {
              // console.log(res.data)
              // 发送短信之后开始倒计时
              this.daojitime()
            })
          })
        })
      })
    },
    daojitime () {
      this.codeTime = window.setInterval(() => {
        this.codeSeconds--
        if (this.codeSeconds <= 0) {
          this.codeSeconds = djs// 倒计时时间回复初始状态
          window.clearInterval(this.codeTime)// 清除计时器
          this.codeTime = null// 清除定时器标记
        }
      }, 1000)
    },
    handleSendcode () {
      // 单独校验手机号码是否有效  validateField 方法
      this.$refs['form'].validateField('mobile', errmsg => {
        if (errmsg.trim().length > 0) {
          return
        }
        // 手机号码有效，初始化验证码
        // this.showGeetest()

        // 是否有验证码插件
        if (this.captchaObj) {
          // 如果输入的手机号与初始化验证码后的手机号不同
          if (this.form.mobile !== this.sendMobile) {
            // 就基于当前输入的手机号重新初始化
            this.showGeetest()
          } else {
            // 相同的话就直接弹出验证码
            this.captchaObj.verify()
          }
        } else {
          // 第一次初始化的验证码插件
          this.showGeetest()
        }
      })
    }
  }
}
</script>

<style scoped>
.login-wrap {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url('cxk2.gif')
}
.login-form-wrap {
  background: rgba(255, 255, 255, 0.4);
  padding: 30px 20px 0px 20px;
  border-radius: 8px;
}
.btn-login {
  width: 100%;
}
.login-head {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}
.el-checkbox {
  margin-left: 20px;
  margin-right: 15px;
}
</style>
