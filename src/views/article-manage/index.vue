<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="listQuery" class="demo-form-inline">
        <el-form-item label="发布时间">
          <el-date-picker
            v-model="listQuery.time"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item label="文章标题">
          <el-input v-model="listQuery.title" placeholder="文章标题" />
        </el-form-item>

        <el-form-item label="分类">
          <el-select v-model="listQuery.type" placeholder="选择分类">
            <el-option
              v-for="(item,index) in typeOpitons"
              :key="'cate'+index"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="上线状态">
          <el-select v-model="listQuery.status" placeholder="选择状态">
            <el-option label="全部" value="all" />
            <el-option label="上线" value="1" />
            <el-option label="下线" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="listQuery.keyword" placeholder="关键词" />
        </el-form-item>
        <el-form-item label="是否推荐">
          <el-select v-model="listQuery.recommend" placeholder="选择推荐">
            <el-option label="全部" value="all" />
            <el-option label="推荐" value="1" />
            <el-option label="不推荐" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="文章来源">
          <el-input v-model="listQuery.source" placeholder="文章来源" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button type="primary" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-row style="margin-bottom:20px;display:flex;">
      <div class="row-left">
        <el-button
          v-for="(item,index) in batchBtns"
          :key="item.code+index"
          :type="item.type"
          :disabled="batchDisabled"
          size="mini"
          @click="bathConfirm(item)"
        >{{ item.name }}</el-button>
      </div>
      <div class="row-right">
        <el-button
          v-for="(item,index) in routeBtns"
          :key="item.path+index"
          :type="item.type"
          size="mini"
          @click="routeClick(item)"
        >{{ item.name }}</el-button>
      </div>
    </el-row>

    <el-table
      ref="multipleTable"
      :data="tableData"
      border
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="articleId" label="id" width="305" />
      <el-table-column label="发布时间" width="170">
        <template slot-scope="scope">{{ scope.row.gmtCreated }}</template>
      </el-table-column>
      <el-table-column prop="title" label="文章标题" width="200" show-overflow-tooltip />
      <el-table-column prop="type" label="文章分类" width="200" show-overflow-tooltip />
      <el-table-column label="关键词" show-overflow-tooltip width="200">
        <template slot-scope="scope">{{ scope.row.keywords ? scope.row.keywords.join(',') :''}}</template>
      </el-table-column>
      <el-table-column prop="source" label="文章来源" show-overflow-tooltip />
      <el-table-column label="上线状态" show-overflow-tooltip>
        <template slot-scope="scope">{{ getStatus(scope.row.status) }}</template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="400">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="preview(row)">预览</el-button>
          <el-button
            v-if="row.status == '1'"
            size="mini"
            type="primary"
            @click="aloneActions('offline','下线',row)"
          >下线</el-button>
          <el-button
            v-if="row.status == '0'"
            size="mini"
            type="primary"
            @click="aloneActions('online','上线',row)"
          >上线</el-button>
          <el-button
            style="width:80px"
            v-if="row.recommend == '0'"
            type="primary"
            size="mini"
            @click="aloneActions('recom','推荐',row)"
          >推荐</el-button>
          <el-button
            v-if="row.recommend == '1'"
            type="primary"
            size="mini"
            @click="aloneActions('unrecom','推荐',row)"
          >取消推荐</el-button>
          <el-button size="mini" type="primary" @click="editArticle(row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="aloneActions('delete','删除',row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.size"
      @pagination="getList"
    />
    <!-- //delete -->
    <el-dialog title="批量操作" :visible.sync="batchDialogShow" width="30%">
      <span>{{ `确认此批量${currentBath.name}操作吗?` }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="batchDialogShow= false">取 消</el-button>
        <el-button type="primary" @click="batchActions">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="文章操作" :visible.sync="aloneDialog.show" width="30%">
      <span>{{ `确认此${aloneDialog.name}操作吗?` }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="aloneDialog.show= false">取 消</el-button>
        <el-button type="primary" @click="aloneActionsDown">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  test,
  fetchArticleList,
  fetchPv,
  createArticle,
  updateArticle,
  fetchCategoryListForChose,
  deleteArticle,
  lineArticle,
  reArticle,
  lineArticleBath,
  unreArticleBath,
  deleteArticleBatch
} from "@/api/article-manage";
import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination
import moment from "moment";
export default {
  name: "ArticleManage",
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: "success",
        draft: "info",
        deleted: "danger"
      };
      return statusMap[status];
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type];
    }
  },
  data() {
    return {
      typeOpitons: [],
      batchDialogShow: false,
      aloneDialog: {
        show: false,
        name: ""
      },
      aloneItem: {},
      currentBath: {
        name: ""
      },
      batchBtns: [
        {
          name: "上线",
          type: "primary",
          code: "status",
          params: {
            status: 1
          }
        },
        {
          name: "下线",
          type: "warning",
          code: "status",
          params: {
            status: 0
          }
        },
        // {
        //   name: "推荐",
        //   type: "primary",
        //   code: "recommend",
        //   params: {
        //     recommend: 1
        //   }
        // },
        // {
        //   name: "取消推荐",
        //   type: "warning",
        //   code: "recommend",
        //   params: {
        //     recommend: 0
        //   }
        // },
        {
          name: "删除",
          type: "danger",
          code: "delete",
          params: null
        }
      ],
      routeBtns: [
        {
          name: "添加文章",
          type: "primary",
          path: "actions?code=add"
        },
        {
          name: "文章分类管理",
          type: "primary",
          path: "/articleManage/category"
        }
      ],
      tableData: [],
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        size: 20,
        time: [],
        title: "",
        type: "",
        keyword: "",
        recommend: "",
        source: "",
        status: ""
      },
      multipleSelection: []
    };
  },
  computed: {
    batchDisabled() {
      return !this.multipleSelection.length;
    }
  },
  created() {
    this.getCategory();
    this.getList();
  },
  methods: {
    preview(item){
      window.open(location.origin+`/article/${item.articleId}`)
    },
    reset() {
      this.listQuery = {
        page: 1,
        size: 20,
        time: [],
        title: "",
        type: "",
        keyword: "",
        recommend: "",
        source: ""
      };
      this.getList();
    },
    editArticle(item) {
      this.$router.push(`actions?code=edit&id=${item.articleId}`);
    },
    routeClick(item) {
      this.$router.push(item.path);
    },
    async getCategory() {
      let res = await fetchCategoryListForChose();
      if (res.code == "000000") {
        this.typeOpitons = res.data;
        this.typeOpitons.unshift({
          id:'all',
          name:'全部'
        })
      }
    },
    bathConfirm(item) {
      this.currentBath = item;
      this.batchDialogShow = true;
    },
    aloneActions(action, name, item) {
      this.aloneItem = item;
      this.aloneItem.action = action;
      this.aloneDialog.name = name;
      this.aloneDialog.show = true;
    },
    async aloneActionsDown() {
      let action = this.aloneItem.action;
      if (action === "online" || action === "offline") {
        let body = {
          id: this.aloneItem.articleId,
          status: this.aloneItem.status == 0 ? 1 : 0
        };
        let res = await lineArticle(body);
        if (res.code == "000000") {
          this.aloneDialog.show = false;
          this.getList();
        }
      }
      if (action === "recom" || action === "unrecom") {
        let body = {
          id: this.aloneItem.articleId,
          recommend: this.aloneItem.recommend == 0 ? 1 : 0
        };
        let res = await reArticle(body);
        if (res.code == "000000") {
          this.aloneDialog.show = false;
          this.getList();
        }
      }
      if (action === "delete") {
        let res = await deleteArticle(this.aloneItem.articleId);
        if (res.code == "000000") {
          this.aloneDialog.show = false;
          this.getList();
        }
      }
    },
    async batchActions() {
      const item = this.currentBath;
      if (item.code === "status") {
        // 状态上下线
        const params = item.params;
        let data = new FormData();
        data.append("articleIds", this.multipleSelection);
        let res = await lineArticleBath(params.status, data);
        if (res.code == "000000") {
          this.batchDialogShow = false;
          this.getList();
        }
      }
      if (item.code === "recommend") {
        // 推荐不推荐
        // const params = item.params;
        //  let data = new FormData();
        // data.append('articleIds',this.multipleSelection)
        // let res = await unreArticleBath(params.recommend,data);
        // if(res.code == '000000'){
        //   this.batchDialogShow = false;
        //   this.getList()
        // }
      }
      if (item.code === "delete") {
        const params = item.params;
        let data = new FormData();
        data.append("articleIds", this.multipleSelection);
        let res = await deleteArticleBatch(data);
        if (res.code == "000000") {
          this.batchDialogShow = false;
          this.getList();
        }
        // 删除
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val.map(x => x.articleId);
    },
    getStatus(item) {
      if (item == "1") return "上线";
      return "下线";
    },
    onSearch() {
      this.listQuery.page = 1;
      this.getList();
    },
    async getList() {
      this.listLoading = true;
      let body = {
        startTime:
          this.listQuery.time && this.listQuery.time.length
            ? moment(this.listQuery.time[0]).format("YYYY.MM.DD")
            : "",
        endTime:
          this.listQuery.time && this.listQuery.time.length
            ? moment(this.listQuery.time[1]).format("YYYY.MM.DD")
            : "",
        title: this.listQuery.title,
        type: this.listQuery.type,
        status: this.listQuery.status,
        keyword: this.listQuery.keyword,
        recommend: this.listQuery.recommend
          ? Number(this.listQuery.recommend)
          : "",
        source: this.listQuery.source
      };
      let req = this.formatReq(body);
      let res = await fetchArticleList(this.listQuery, req);
      if (res.code == "000000") {
        this.tableData = res.data.contents.sort((a,b) =>new Date(b.gmtCreated).getTime() -new Date(a.gmtCreated).getTime());
        this.total = res.data.totalCount;
      }
      this.listLoading = false;
    },
    formatReq(req) {
      let obj = {};
      for (let key in req) {
        if (
          (req[key] &&
            req[key] !== "" &&
            req[key] !== undefined &&
            req[key] !== null &&
            req[key] !== "all" &&
            req[key] !== "全部") ||
          req[key] === 0
        ) {
          obj[key] = req[key];
        }
      }
      return obj;
    }
  }
};
</script>

<style lang="scss" scoped>
.row-left {
  flex: 0 0 50%;
  text-align: left;
}
.row-right {
  flex: 0 0 50%;
  text-align: right;
}
</style>
