<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 书籍管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-button
                    type="primary"
                    icon="el-icon-delete"
                    class="handle-del mr10"
                    @click="delAllSelection"
                >批量删除</el-button>
                <el-input v-model="query.des" placeholder="书籍名或者ISBN码" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            </div>
            <el-table
                :data="tableData"
                border
                class="table"
                ref="multipleTable"
                header-cell-class-name="table-header"
                @selection-change="handleSelectionChange"
            >
                <el-table-column type="selection" width="55" align="center"></el-table-column>
                <el-table-column prop="id" label="ID" width="55" align="center"></el-table-column>
                <el-table-column prop="bookName" label="书籍"></el-table-column>
                <el-table-column prop="authorId" label="作者Id"></el-table-column>
                <el-table-column prop="isbn" label="ISBN"></el-table-column>
                <el-table-column label="插图(查看大图)" align="center">
                    <template slot-scope="scope">
                        <el-popover
                            placement="right"
                            title=""
                            trigger="hover">
                            <img :src="scope.row.imgSrc" style="max-height: 250px;max-width: 500px"/>
                            <img slot="reference" :src="scope.row.imgSrc" :alt="scope.row.imgSrc" style="max-height: 50px;max-width: 130px">
                        </el-popover>
                    </template>
                </el-table-column>
                <el-table-column prop="publisher" label="出版社"></el-table-column>
                <el-table-column prop="publishTime" label="出版时间"></el-table-column>
                <el-table-column prop="updateTime" label="更新时间"></el-table-column>
                <el-table-column label="操作" width="180" align="center">
                    <template slot-scope="scope">
                        <el-button
                            type="text"
                            icon="el-icon-edit"
                            @click="handleEdit(scope.$index, scope.row)"
                        >编辑</el-button>
                        <el-button
                            type="text"
                            icon="el-icon-delete"
                            class="red"
                            @click="handleDelete(scope.$index, scope.row)"
                        >删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
           
            <div class="pagination">
                <el-pagination
                    background
                    layout="total, prev, pager, next"
                    @current-change="handlePageChange"
                    :current-page="query.pageIndex"
                    :page-size="query.pageSize"
                    :total="pageTotal"
                ></el-pagination>
            </div>
        </div>

        <!-- 编辑弹出框 -->
        <el-dialog title="编辑" :visible.sync="editVisible" width="30%">
            <el-form ref="form" :model="form" label-width="70px">
                <el-form-item label="用户名">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="地址">
                    <el-input v-model="form.address"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { fetchData } from '../../api/index';
export default {
    name: 'basetable',
    data() {
        return {
            query: {
                searchTag: '',
                des: '',
                pageIndex: 1,
                pageSize: 0
            },
            tableData: [],
            multipleSelection: [],
            delList: [],
            editVisible: false,
            pageTotal: 0,
            form: {},
            idx: -1,
            id: -1,
            searchFlag: false
        };
    },
    filters: {
    // 书名超过字数 省略
        ellipsis (value) {
        if (!value) return ''
        if (!value) return ''
        if (value.length > 8) {
            return value.slice(0, 8) + '...'
        }
        return value
        }
    },
    created() {
        this.getData(this.query.pageIndex);
    },
    methods: {
        getData(page) {
            var _this = this
            this.$axios.get('book/alist/' + page)
                .then(response => {
                console.log(response.data)
                _this.tableData = response.data.records
                _this.pageTotal = response.data.total
                _this.query.pageSize = response.data.size
                _this.query.pageIndex = response.data.current
                })
                .catch(function (error) {
                console.log(error)
                })
        },
        // 触发搜索按钮
        handleSearch() {
            this.$set(this.query, 'pageIndex', 1);
            var _this = this
            // 默认搜索都是第一页
            this.$axios.get('book/asearch/'+ this.query.pageIndex,{ params:{
                des: this.query.des
            }

            })
                .then(response => {
                    console.log(response.data)
                    // 设置搜索标志
                    _this.searchFlag = true
                    _this.tableData = response.data.records
                    _this.pageTotal = response.data.total
                    _this.query.pageIndex = response.data.current
                })
                .catch(function (error) {
                console.log(error)
            })
        },
        // 删除操作
        handleDelete(index, row) {
            var _this = this
            // 二次确认删除
            this.$confirm('确定要删除吗？', '提示', {
                type: 'warning'
            })
                .then(() => {
                    // 删除
                this.$axios.delete('book/delete',{
                    data: {
                        "id":row.id
                        }
                    })
                    .then(response => {
                        console.log(response.data)
                        _this.tableData.splice(index, 1)
                        _this.$message.success('删除成功')
                        // 刷新当前页面
                        _this.getData(_this.query.pageIndex)
                    })
                    .catch(function (error) {
                    console.log(error)
                })
                })
                .catch(() => {});
        },
        // 多选操作
        handleSelectionChange(val) {
            this.multipleSelection = val;
        },
        delAllSelection() {
            const length = this.multipleSelection.length;
            let str = '';
            this.delList = this.delList.concat(this.multipleSelection);
            for (let i = 0; i < length; i++) {
                str += this.multipleSelection[i].name + ' ';
            }
            this.$message.error(`删除了${str}`);
            this.multipleSelection = [];
        },
        // 编辑操作
        handleEdit(index, row) {
            this.idx = index;
            this.form = row;
            this.editVisible = true;
        },
        // 保存编辑
        saveEdit() {
            this.editVisible = false;
            this.$message.success(`修改第 ${this.idx + 1} 行成功`);
            this.$set(this.tableData, this.idx, this.form);
        },
        // 分页导航
        handlePageChange(val) {
            // this.$set(this.query, 'pageIndex', val);
            if(this.query.searchTag === '' && this.query.des === '') {
                this.searchFlag = false
            }

            if (this.query.des !== '' || this.searchFlag !== false) {
                this.handleSearch()
            } else {
                this.getData(val)
            }
        }
    }
};
</script>

<style scoped>
.handle-box {
    margin-bottom: 20px;
}

.handle-select {
    width: 120px;
}

.handle-input {
    width: 300px;
    display: inline-block;
}

.table {
    width: 100%;
    font-size: 14px;
}
.red {
    color: #ff0000;
}
.mr10 {
    margin-right: 10px;
}
.table-td-thumb {
    display: block;
    margin: auto;
    width: 40px;
    height: 40px;
}
  .book-container{
      margin-left:3% ;
   }
  .book-item {
    width:140px;
    float: left;
    margin-right:25px;
    margin-bottom: 20px;
  }

  .tag-book-card {
    cursor: pointer;
    background-color: #fcfcfc
  }

  .tag-img-book{
    padding-left: 11px;
    padding-top: 5px;
    width: 115px;
    height: 172px;
  }

  .tag-book-author {
    margin-top: 8px;
    line-height: 10px;
    font-size: 13px;
  }

  .tag-book-bottom {
    padding-left: 8px;
    padding-top: 0px;
    padding-bottom: 10px;
  }
  .book-pagination {
    position: absolute;
    margin-top: 420px;
    margin-left: 65%;
  }
</style>
