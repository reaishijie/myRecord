<template>
  <div class="user-container">
    <div class="user-profile">
      <h2>用户信息</h2>

      <el-card class="user-card">
        <div class="user-header">
          <el-avatar :size="80" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
          <div class="user-info">
            <h3>{{ userInfo.data.username || '未设置'}}</h3>
            <p>ID: {{ userInfo.data.id || '未设置'}}</p>
            <p>注册时间: {{ userInfo.data.createdAt || '未设置'}}</p>
          </div>
        </div>  

        <el-divider />

        <div class="user-details">
          <el-descriptions title="个人信息" :column="2" border>
            <el-descriptions-item label="昵称 ">{{ userInfo.data.nickname || '未设置'}}</el-descriptions-item>
            <el-descriptions-item label="手机">{{ userInfo.data.phone || '未设置' }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ userInfo.data.email }}</el-descriptions-item>
            <el-descriptions-item label="地址">北京市朝阳区</el-descriptions-item>
            <el-descriptions-item label="账号状态">
              <el-tag type="success">正常</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="会员级别">
              <el-tag type="warning">{{ userInfo.data.role === 'user' ? '普通用户' : '管理员' }}</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <el-divider />

        <div class="user-actions">
          <h4>账户操作</h4>
          <div class="action-buttons">
            <el-button type="primary">编辑资料</el-button>
            <el-button type="warning">修改密码</el-button>
            <el-button type="info">消息中心</el-button>
            <el-button type="danger">注销账户</el-button>
          </div>
        </div>
      </el-card>

      <!-- 订单列表部分 -->
      <div class="user-orders">
        <h3>最近订单</h3>
        <el-table :data="orderData" stripe style="width: 100%">
          <el-table-column prop="id" label="记录编号" width="180" />
          <el-table-column prop="date" label="记录日期" width="180" />
          <el-table-column prop="name" label="记录名称" />
          <el-table-column prop="price" label="金额" width="120" />
          <el-table-column prop="status" label="状态" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.statusType">{{ scope.row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default>
              <el-button link type="primary" size="small">查看</el-button>
              <el-button link type="primary" size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { getUserProfile } from '../../api/user';

const userInfo = reactive({
  data: {
  }
});

async function fetchUserInfo() {
  try {
    const profile = await getUserProfile();
    console.log(profile)
    Object.assign(userInfo, profile);
    console.log('@@' ,userInfo.data)
  } catch (error) {
    console.error(error);
  }
}

onMounted(() => {
  fetchUserInfo();
});


// 模拟订单数据
const orderData = [
  {
    id: '202404010001',
    date: '2024-04-01',
    name: '商品A',
    price: '¥299.00',
    status: '已完成',
    statusType: 'success'
  },
  {
    id: '202404020002',
    date: '2024-04-02',
    name: '商品B',
    price: '¥199.00',
    status: '待发货',
    statusType: 'warning'
  },
  {
    id: '202404030003',
    date: '2024-04-03',
    name: '商品C',
    price: '¥599.00',
    status: '运输中',
    statusType: 'primary'
  },
  {
    id: '202404040004',
    date: '2024-04-04',
    name: '商品D',
    price: '¥99.00',
    status: '已取消',
    statusType: 'info'
  }
]
</script>

<style scoped>
.user-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.user-profile {
  width: 100%;
}

.user-card {
  margin-bottom: 30px;
}

.user-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.user-info {
  margin-left: 20px;
}

.user-info h3 {
  margin: 0 0 5px 0;
  font-size: 20px;
}

.user-info p {
  margin: 5px 0;
  color: #666;
}

.user-details {
  margin: 20px 0;
}

.user-actions {
  margin-top: 20px;
}

.user-actions h4 {
  margin-bottom: 15px;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.user-orders {
  margin-top: 30px;
}

.user-orders h3 {
  margin-bottom: 15px;
}

/* 在小屏幕上调整布局 */
@media (max-width: 768px) {
  .user-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .user-info {
    margin-left: 0;
    margin-top: 15px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .el-button {
    width: 100%;
    margin-left: 0 !important;
    margin-bottom: 10px;
  }
}
</style>