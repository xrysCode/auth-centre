
<template>
<!-- @click="addTab(menu.routerPath,menu.menuName)" -->
  <el-menu-item  v-for="menu in menuArr" :key="menu.id" :index="menu.routerPath" >
    {{menu.menuName}}
    <menu-item v-if="menu.children" :menuArr="menu.children"/>
  </el-menu-item>

</template>

<script lang="ts">
import { defineComponent, ref, h, resolveComponent } from 'vue'

export default defineComponent({
  props: { menuArr: Array }

})
</script>
