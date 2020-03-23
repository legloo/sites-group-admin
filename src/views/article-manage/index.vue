<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="listQuery" class="demo-form-inline">
        <el-form-item label="发布时间">
          <el-date-picker
            v-model="listQuery.time"
            type="datetimerange"
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
            <el-option label="分类1" value="1" />
            <el-option label="分类2" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="上线状态">
          <el-select v-model="listQuery.status" placeholder="选择状态">
            <el-option label="状态1" value="1" />
            <el-option label="状态2" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="listQuery.keyword" placeholder="关键词" />
        </el-form-item>
        <el-form-item label="是否推荐">
          <el-select v-model="listQuery.recommend" placeholder="选择推荐">
            <el-option label="推荐" value="1" />
            <el-option label="不推荐" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="文章来源">
          <el-input v-model="listQuery.source" placeholder="文章标题" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-row style="margin-bottom:20px">
      <el-button
        v-for="(item,index) in batchBtns"
        :key="item.code+index"
        :type="item.type"
        :disabled="batchDisabled"
        size="mini"
        @click="bathConfirm(item)"
      >{{ item.name }}</el-button>
    </el-row>

    <el-table
      ref="multipleTable"
      :data="tableData"
      border
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="articleId" label="id" width="55" />
      <el-table-column label="发布时间" width="170">
        <template slot-scope="scope">{{ scope.row.onlineTime }}</template>
      </el-table-column>
      <el-table-column prop="title" label="文章标题" width="200" show-overflow-tooltip />
      <el-table-column prop="type" label="文章分类" width="200" show-overflow-tooltip />
      <el-table-column label="关键词" show-overflow-tooltip width="200">
        <template slot-scope="scope">{{ scope.row.keywords.join(';') }}</template>
      </el-table-column>
      <el-table-column prop="source" label="文章来源" show-overflow-tooltip />
      <el-table-column label="上线状态" show-overflow-tooltip>
        <template slot-scope="scope">{{ getStatus(scope.row.status) }}</template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="400">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini">预览</el-button>
          <el-button v-if="row.status == '1'" size="mini" type="primary">下线</el-button>
          <el-button v-if="row.status == '0'" size="mini" type="primary">上线</el-button>
          <el-button v-if="row.recommend == '1'" type="primary" size="mini">推荐</el-button>
          <el-button v-if="row.recommend == '0'" type="primary" size="mini">取消推荐</el-button>
          <el-button size="mini" type="primary">编辑</el-button>
          <el-button size="mini" type="danger">删除</el-button>
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
  </div>
</template>

<script>
import {
  fetchList,
  fetchPv,
  createArticle,
  updateArticle
} from '@/api/article'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ArticleManage',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      batchDialogShow: false,
      currentBath: {
        name: ''
      },
      batchBtns: [
        {
          name: '上线',
          type: 'primary',
          code: 'status',
          params: {
            status: 1
          }
        },
        {
          name: '下线',
          type: 'warning',
          code: 'status',
          params: {
            status: 0
          }
        },
        {
          name: '推荐',
          type: 'primary',
          code: 'recommend',
          params: {
            recommend: 1
          }
        },
        {
          name: '取消推荐',
          type: 'warning',
          code: 'recommend',
          params: {
            recommend: 0
          }
        },
        {
          name: '删除',
          type: 'danger',
          code: 'delete',
          params: null
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
        title: '',
        type: '',
        keyword: '',
        recommend: '',
        source: ''
      },
      multipleSelection: []
    }
  },
  computed: {
    batchDisabled() {
      return !this.multipleSelection.length
    }
  },
  created() {
    this.getList()
  },
  methods: {
    bathConfirm(item) {
      this.currentBath = item
      this.batchDialogShow = true
    },
    batchActions() {
      const item = this.currentBath
      console.log(item)
      console.log(this.multipleSelection)
      if (item.code === 'status') {
        // 状态上下线
        const params = item.param
      }
      if (item.code === 'recommend') {
        // 推荐不推荐
        const params = item.param
      }
      if (item.code === 'delete') {
        // 删除
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val.map(x => x.articleId)
    },
    getStatus(item) {
      if (item == '1') return '上线'
      return '下线'
    },
    onSearch() {
      console.log(this.listQuery)
    },
    getList() {
      this.tableData = []
      console.log(this.listQuery)
      this.listLoading = true
      for (let i = 0; i < 20; i++) {
        this.tableData.push({
          articleId: i + '',
          keywords: ['中文', '英文'],
          onlineTime: '2020-03-21 21:07:14',
          recommend: Math.random() * 100 > 50 ? 1 : 0,
          source: '来源',
          status: Math.random() * 100 > 50 ? 1 : 0,
          title: '标题标题标题标题标题标题标题标题标题标题标题标',
          type: '新闻'
        })
      }
      this.total = this.tableData.length
      this.listLoading = false
    },
    formatJson(filterVal) {
      return this.list.map(v =>
        filterVal.map(j => {
          if (j === 'timestamp') {
            return parseTime(v[j])
          } else {
            return v[j]
          }
        })
      )
    }
  }
}
</script>
