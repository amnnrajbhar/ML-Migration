import { Component, OnInit, ViewChild } from '@angular/core';
import { APIURLS } from '../../../shared/api-url';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { AppComponent } from '../../../app.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthData } from '../../../auth/auth.model';
import { ExcelService } from '../../../shared/excel-service';
import swal from 'sweetalert';
import { DataStorageService } from '../../Services/data-storage.service';
import { MasterDataService } from '../../Services/masterdata.service';
import { NgForm } from '@angular/forms';
import { Util } from '../../Services/util.service';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-allowancemapping',
  templateUrl: './allowancemapping.component.html',
  styleUrls: ['./allowancemapping.component.css'],
  providers: [Util]
})
export class AllowancemappingComponent implements OnInit {

@ViewChild(NgForm, { static: false }) detailsForm: NgForm;

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private excelService: ExcelService, private masterDataService: MasterDataService, private util: Util) { }

  currentUser: AuthData;
  isLoading: boolean = false;
  filterData: any = {};
  filterModel: any = {};
  plantList: any[] = [];
  payGroupList: any[] = [];
  payGroupFullList: any[] = [];
  filterPayGroupList: any[] = [];
  employeeCategoryList: any[] = [];
  designationList: any[] = [];
  editIndex: number = -1;
  item: any = {};
  isEdit: boolean = false;
  count: number = 0;
  files: any[] = [];
  errorData: any = {};
  metroList = [{type: "Yes"}, {type: "No"}];

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.filterModel.pageNo = 1;
    this.filterModel.pageSize = 10;
    //this.filterModel.employeeId = this.currentUser.uid;
    this.filterModel.plantId = "";
    this.filterModel.payGroupId = "";
    this.filterModel.employeeCategoryId = "";
    this.filterModel.designationId = "";
    this.filterModel.allowanceTypeId = "";
    this.filterModel.metro = "";


    //this.masterDataService.getPlantListAssigned(this.currentUser.uid).then(data => this.plantList = data);
    this.masterDataService.getPlantList().then((data: any) => { this.plantList = data; });
    this.masterDataService.getPayGroupList().then((data: any) => { this.payGroupFullList = data; });
    this.masterDataService.getEmployeeCategoryList().then((data: any) => { this.employeeCategoryList = data; });
    this.masterDataService.getDesignation().then((data: any) => { this.designationList = data; });
    this.getAllowanceList();
    this.getListData();

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
    if(this.item.metroBool)
    this.item.metro = "Y"
    if(!this.item.metroBool)
    this.item.metro = "N"
    this.item.createdById = this.currentUser.uid;
    this.item.createdDate = this.util.getFormatedDateTime(new Date());
    this.item.modifiedById = this.currentUser.uid;
    this.item.modifiedDate = this.util.getFormatedDateTime(new Date());

    this.httpService.HRpost(APIURLS.BR_ALLOWANCE_MAPPING_CONFIG, this.item)
      .then((data: any) => {
        //console.log(data);
        if (data == 200 || data.id > 0) {
          this.item.id = data.id;
          this.onAddLine();
          toastr.success("Successfully added the details.");
          $("#detailsModal").modal("hide");
          this.getData();
        }
        else {
          toastr.error(data.validationMessage);
        }
        console.log(data);
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        toastr.error('Error adding details...' + error);
      })
  }

  updateData() {
    toastr.info("Updating...");
    this.isLoading = true;
    if(this.item.metroBool)
    this.item.metro = "Y"
    if(!this.item.metroBool)
    this.item.metro = "N"
    this.item.modifiedById = this.currentUser.uid;
    this.item.modifiedDate = this.util.getFormatedDateTime(new Date());

    this.httpService.HRpost(APIURLS.HR_ALLOWANCE_MAPPING_UPDATE, this.item)
      .then((data: any) => {
        if (data == 200 || data.success) {
          this.onUpdateLine();
          toastr.success("Successfully updated the details.");
          $("#detailsModal").modal("hide");
          this.getData();
        }
        else {
          toastr.error(data.message);
        }
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        toastr.error('Error updating details...' + error);
      })
  }

  onUpdateLine() {
    this.filterData.list[this.editIndex] = this.item;
    this.clearInput();
  }

  onAddLine() {
    this.filterData.list.push(this.item);
    this.count++;
    this.clearInput();
  }

  getListData() {
    this.filterModel.pageNo = 1;
    this.getData();
  }

  getData() {
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.BR_GET_ALLOWANCE_MAPPING_CONFIG_LIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterData = data;

      this.isLoading = false;
    }).catch(error => {
      toastr.error("Error while fetching the list. Error: " + error);
      this.isLoading = false;
    });
  }

  onAddClick() {
    this.clearInput();
    $("#detailsModal").modal("show");
  }

  EditLine(item, index) {
    this.item = Object.assign({}, item);
    this.onPlantChange();
    this.isEdit = true;
    this.editIndex = index;
    $("#detailsModal").modal("show");
  }

  exportData() {
    this.filterModel.export = true;
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.BR_GET_ALLOWANCE_MAPPING_CONFIG_LIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList = [];
      let index = 0;
      data.list.forEach(item => {
        index = index + 1;
        let exportItem = {
          "Sl No": index,
          "ALLOWANCE_TYPE": item.allowanceTypeName,
          "PLANT_ID": item.plantId,
          "PLANT": item.plantName,
          "PAY_GROUP_ID": item.payGroupId,
          "PAY_GROUP": item.payGroupName,
          "CATEGORY_ID": item.employeeCategoryId,
          "CATEGORY": item.employeeCategoryName,
          "Metro": item.metroBool == true ? "Yes" : "No",
          "Created By": item.createdByName,
          "Created Date": this.setDateFormate(item.createdDate),
          "Modified By": item.modifiedByName,
          "Modified Date": this.setDateFormate(item.modifiedDate),
        };
        exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'AllowanceMappingConfig_List');
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.filterModel.export = false;
      swal('Error occurred while fetching data.');
      return;
    });
  }

  setDateFormate(date: any): string {
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear();
  }

  errorCount = 0;
  delete() {
    var selectedList = this.filterData.list.filter(x => x.selected);
    if (selectedList.length <= 0) {
      toastr.error("Please select at least one record to delete.");
      return;
    }

    if (!confirm("Are you sure you want to delete the selected records?")) return;

    this.errorCount = 0;
    toastr.info("Deleting...");
    for (var t of selectedList) {

      this.httpService.HRdelete(APIURLS.BR_ALLOWANCE_MAPPING_CONFIG, t.id).then((data: any) => {
        if (data) {
          if (!data.success) {
            this.errorCount++;
          }
          else {
            toastr.info("Records deleted successfully");
          }
        }
      }).catch(error => {
        this.errorCount++;
      });
    }
    setTimeout(() => { this.getData(); }, 3000);

  }

  getFiles(event: any) {
    this.files = event.target.files;
  }

  getPayGroupList() {
    console.log('hi');
    if (this.item.plantId > 0) {
      this.httpService.HRget(APIURLS.OFFER_GET_PAY_GROUPS_ASSIGNED + "/" + this.currentUser.uid + "/" + this.item.plantId).then((data: any) => {
        if (data.length > 0) {
          this.payGroupList = data.sort((a, b) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
        }
      }).catch(error => {
        this.payGroupList = [];
      });
    }
    else
      this.payGroupList = [];
  }

  allowanceList: any[] = [];
  getAllowanceList() {
    this.httpService.HRget(APIURLS.BR_GET_ALLOWANCE_MAPPING_CONFIG_GET_ALLOWANCE)
      .then((data: any) => {
        if (data.length > 0) {
          this.allowanceList = data.sort((a, b) => { if (a.allowanceType > b.allowanceType) return 1; if (a.allowanceType < b.allowanceType) return -1; return 0; });
        }
      }).catch(error => {
        this.allowanceList = [];
      });
  }

  onPlantChange(){
    if(this.item.plantId > 0){
      let plant = this.plantList.find(x=>x.id == this.item.plantId)
      this.payGroupList = this.payGroupFullList.filter(x=>x.plant == plant.code);
    }
    else
      this.payGroupList = [];
  }
  
  onFilterPlantChange(){
    if(this.filterModel.plantId > 0){
      let plant = this.plantList.find(x=>x.id == this.filterModel.plantId)
      this.filterPayGroupList = this.payGroupFullList.filter(x=>x.plant == plant.code);
    }
    else
      this.filterPayGroupList = [];
  }
}
