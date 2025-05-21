<template>
  <div class="user-avatar-container">
    <img :src="user.avatar ? user.avatar : defaultAvatar" class="user-avatar">
  </div>
</template>

<script>
import defaultAvatarSrc from '@/assets/images/profile.jpg' // Create a default avatar image or use one from your assets

export default {
  name: 'UserAvatar',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      defaultAvatar: defaultAvatarSrc
    }
  }
}
</script>

<style scoped>
.user-avatar-container {
  text-align: center;
}
.user-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 2px solid #eee;
}
</style>
