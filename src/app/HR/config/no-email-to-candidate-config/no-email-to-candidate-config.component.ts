import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { Router, RouterModule } from '@angular/router';
import { ExcelService } from '../../../shared/excel-service';
import { AuthData } from '../../../auth/auth.model';
declare var $: any;
declare var toastr: any;
import { NgForm } from '@angular/forms';
import { MasterDataService } from '../../Services/masterdata.service';
import { Util } from '../../Services/util.service';

@Component({
  selector: 'app-no-email-to-candidate-config',
  templateUrl: './no-email-to-candidate-config.component.html',
  styleUrls: ['./no-email-to-candidate-config.component.css'],
  providers: [Util]
})

export class NoEmailToCandidateConfigComponent implements OnInit {
  @ViewChild(NgForm) detailsForm: NgForm;
  isEdit: boolean = false;
  editIndex: number = -1;
  count: number = 0;

  isLoading: boolean = false;
  plantList: any[] = [];
  payGroupList: any[] = [];
  payGroupFullList: any[] = [];
  filterPayGroupList: any[] = [];
  employeeCategoryList: any[] = [];
  stateList: any[] = [];
  filterData: any = {};
  currentUser: AuthData;
  item: any = {};
  filterModel: any = {};

  constructor(private httpService: HttpService, private util: Util,
    private router: Router, private excelService: ExcelService, private masterDataService: MasterDataService) {
    currentUser: AuthData;
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.filterModel.pageSize = 10;
    this.filterModel.selectedPlantId = "";
    this.filterModel.selectedPayGroupId = "";
    this.filterModel.selectedEmployeeCategoryId = "";
    this.filterModel.selectedStateId = "";
    this.masterDataService.getPlantList().then((data: any) => { this.plantList = data; });
    this.masterDataService.getPayGroupList().then((data: any) => { this.payGroupFullList = data; });
    this.masterDataService.getEmployeeCategoryList().then((data: any) => { this.employeeCategoryList = data; });
    this.masterDataService.getState().then((data: any) => { this.stateList = data; });
    this.getEmailList();
  }

  gotoPage(no) {
    if (this.filterModel.pageNo == no) return;
    this.filterModel.pageNo = no;
    this.getData();
  }

  pageSizeChange() {
    this.filterModel.pageNo = 1;
    this.getData();
  }

  emailList: any[] = [];
  getEmailList() {
    this.filterModel.pageNo = 1;
    this.getData();
  }

  getData() {
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.NO_EMAIL_CONFIG_GET_LIST, this.filterModel).then((data: any) => {
      this.filterData = data;
      console.log(this.filterData.list);

      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }

  setDateFormate(date: any): string {
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear() + ' ' +
      ("00" + d1.getHours()).slice(-2) + ":" +
      ("00" + d1.getMinutes()).slice(-2) + ":" +
      ("00" + d1.getSeconds()).slice(-2);
  }

  exportData() {
    this.filterModel.export = true;
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.NO_EMAIL_CONFIG_GET_LIST, this.filterModel).then((data: any) => {
      this.emailList = data.list;
      this.filterModel.export = false;
      var exportList = [];
      let index = 0;
      console.log(this.emailList);
      this.emailList.forEach(item => {
        index = index + 1;
        let exportItem = {
          "Sl No": index,
          "Plant": item.plantName,
          "Paygroup": item.payGroupName,
          "Employee Category": item.employeeCategoryName,
          "State": item.stateName,
          "Created By": item.createdByName,
          "Created On": item.createdOn,
          "Modified By": item.modifiedByName,
          "Modifed On": item.modifiedOn

        };
        exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Email_Notification_List');
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.filterModel.export = false;
      toastr.error('Error occurred while fetching data.');
      return;
    });
  }

  onAddClick() {
    this.clearInput();
    $("#detailsModal").modal("show");
  }

  onAddLine() {
    this.filterData.list.push(this.item);
    this.count++;
    this.clearInput();
  }

  clearInput() {
    this.isEdit = false;
    this.item = {};
    this.editIndex = -1;
    this.detailsForm.form.markAsPristine();
    this.detailsForm.form.markAsUntouched();
  }

  addData() {

    toastr.info("Adding...");
    this.isLoading = true;
    this.item.createdById = this.currentUser.uid;
    this.item.modifiedById = this.currentUser.uid;
    this.item.createdDate = this.util.getFormatedDateTime(new Date());
    this.item.modifiedDate = this.util.getFormatedDateTime(new Date());

    this.httpService.HRpost(APIURLS.NO_EMAIL_CONFIG_CREATE, this.item)
      .then((data: any) => {
        if (data == 200 || data.success) {
          this.item.NoEmailToCandidateConfigId = data.NoEmailToCandidateConfigId;
          //this.onAddLine();
          toastr.success("Successfully added the details.");
          $("#detailsModal").modal("hide");
          this.getData();
        }
        else
          toastr.error(data.message);
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        toastr.error('Error adding details...' + error);
      })
  }

  delete(item: any) {
    let connection: any;
    if (confirm("Are you sure you want to delete this record?")) {
      this.isLoading = true;
      connection = this.httpService.HRpost(APIURLS.NO_EMAIL_CONFIG_DELETE, item);

      connection.then(
        (data: any) => {
          this.isLoading = false;
          if (data == 200 || data.success) {
            var msg = 'Deleted successfully';
            toastr.success(msg);
            this.getData();
          }
          else
            toastr.error(data.message);
        },
        (err) => {
          this.isLoading = false;
          toastr.error('Error occured while deleting details. Error:' + err);
        })
        .catch(error => {
          this.isLoading = false;
          toastr.error('Error occured while deleting details. Error:' + error);
        });

    }
  }

  onPlantChange() {
    if (this.item.plantId > 0) {
      let plant = this.plantList.find(x => x.id == this.item.plantId)
      this.payGroupList = this.payGroupFullList.filter(x => x.plant == plant.code);
    }
    else
      this.payGroupList = [];
  }

  onFilterPlantChange() {
    if (this.filterModel.selectedPlantId > 0) {
      let plant = this.plantList.find(x => x.id == this.filterModel.selectedPlantId)
      this.filterPayGroupList = this.payGroupFullList.filter(x => x.plant == plant.code);
    }
    else
      this.filterPayGroupList = [];
  }

}
