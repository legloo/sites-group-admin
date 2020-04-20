<template>
  <div class="container">
    <div class="add_btn">
      <el-button type="primary" size="small" @click="handleClick(null,'add')">添加</el-button>
    </div>
    <el-table :data="tableData" border style="width: 100%">
      <el-table-column type="index" width="50" label="序号"></el-table-column>
      <!-- <el-table-column prop="id" label="id" /> -->
      <el-table-column prop="name" label="分类名称" />
      <el-table-column prop="code" label="分类code" />
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="handleClick(scope.row,'edit')">编辑</el-button>
          <el-button
            v-if="scope.row.empty"
            type="text"
            size="small"
            @click="handleClick(scope.row,'delete')"
          >删除</el-button>
          <el-button type="text" v-if="scope.$index != 0"  size="small" @click="handleIndex(scope.row.id,tableData[scope.$index-1].id)">上移</el-button>
          <el-button type="text" v-if="scope.$index != tableData.length-1" size="small" @click="handleIndex(scope.row.id,tableData[scope.$index+1].id)">下移</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- // -->
    <el-dialog :title="dialog.title" :visible.sync="dialog.show">
      <el-form :model="currentDialogItem" :rules="rules">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="currentDialogItem.name" />
        </el-form-item>
        <el-form-item label="分类code" prop="code">
          <el-input v-model="currentDialogItem.code" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialog.show = false">取 消</el-button>
        <el-button type="primary" @click="dialogOk">确 定</el-button>
      </div>
    </el-dialog>

    <!-- //delete -->
    <el-dialog :title="deleteDialog.title" :visible.sync="deleteDialog.show" width="30%">
      <span>{{ deleteDialog.tips }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteDialog.show = false">取 消</el-button>
        <el-button type="primary" @click="deleteItem">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  fetchCategoryList,
  createCategory,
  editCategory,
  deleteCategory,
  changeIndex
} from "@/api/article-manage";
export default {
  data() {
    return {
      rules: {
        name: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
        code: [{ required: true, message: "请输入分类code", trigger: "blur" }]
      },
      tableData: [
        {
          id: "1",
          name: "分类1",
          empty: false
        },
        {
          id: "2",
          name: "分类2",
          empty: true
        }
      ],
      currentDialogItem: {
        id: "",
        name: "",
        code: ""
      },
      dialog: {
        title: "",
        show: false
      },
      deleteDialog: {
        title: "提示",
        tips: "是否确认删除该分类？",
        show: false
      }
    };
  },
  created() {
    this.getlist();
  },
  methods: {
    async getlist() {
      let res = await fetchCategoryList();
      if (res.code == "000000") {
        this.tableData = res.data;
      }
    },
  async  handleIndex(a,b){
      console.log(a,b);
       let datae = new FormData();
        datae.append("id1", a);
        datae.append("id2", b);
        // 有id则为改
        const res = await changeIndex(datae);
        console.log(res)
        if (res.code == "000000") {
          this.getlist();
        }
    },
    handleClick(row, type) {
      if (type === "delete") {
        this.currentDialogItem = row;
        this.deleteDialog.show = true;
      }
      if (type === "add") {
        this.currentDialogItem.name = "";
        this.currentDialogItem.code = "";
        this.dialog.title = "添加分类";
        this.dialog.show = true;
      }
      if (type === "edit") {
        this.currentDialogItem = row;
        this.dialog.title = "编辑分类";
        this.dialog.show = true;
      }
    },
    async dialogOk() {
      if (this.currentDialogItem.id) {
        let datae = new FormData();
        datae.append("id", this.currentDialogItem.id);
        datae.append("type", this.currentDialogItem.name);
        datae.append("code", this.currentDialogItem.code);
        // 有id则为改
        const res = await editCategory(this.currentDialogItem.id, datae);
        if (res.code == "000000") {
          this.$message.success(res.msg);
          this.currentDialogItem = {
            id: "",
            name: "",
            code: ""
          };
          this.dialog.show = false;
          this.getlist();
        } else {
          this.$message.error(res.msg);
        }
      } else {
        // 无id则为新增
        let data = new FormData();
        data.append("type", this.currentDialogItem.name);
        data.append("code", this.currentDialogItem.code);
        const res = await createCategory(data);
        if (res.code == "000000") {
          this.$message.success(res.msg);
          this.currentDialogItem = {
            id: "",
            name: "",
            code: ""
          };
          this.dialog.show = false;
          this.getlist();
        } else {
          this.$message.error(res.msg);
        }
      }
    },
    async deleteItem() {
      const res = await deleteCategory({ id: this.currentDialogItem.id });
      if (res.code == "000000") {
        this.$message.success(res.msg);
        this.deleteDialog.show = false;
        this.getlist();
      } else {
        this.$message.error(res.msg);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  padding: 20px;
  .add_btn {
    margin-bottom: 20px;
  }
}
</style>
