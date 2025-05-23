import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, NgForm, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import swal from 'sweetalert';
import { AppComponent } from '../../app.component';
import { AuthData } from '../../auth/auth.model';
import { APIURLS } from '../../shared/api-url';
import { AppService } from '../../shared/app.service';
import { HttpService } from '../../shared/http-service';
import { RoomInformation } from './room.model';
import { IfStmt } from '@angular/compiler';
// import { forEach } from '@angular/router/src/utils/collection';
import { RoomType } from '../roomtype-master/roomtype.model';
import { RoomFacility } from '../roomfacilities-master/roomfacility.model';
import { Facilities } from './facility.model';
import { RoomPictures } from './roompictures.model';
import * as _ from "lodash";
import { AuditLogChange } from '../../masters/auditlogchange.model';
import { AuditLog } from '../../masters/auditlog.model';
declare var jQuery: any;
declare var $: any;

export class actionItemModel {
  name: string;
  description: string;
  capacity: number;
  location: string;
  type: string;
  manager_Approval: boolean;
  admin_Approval: boolean;
  facilities: string;
}

@Component({
  selector: 'app-room-maintenance',
  templateUrl: './room-maintenance.component.html',
  styleUrls: ['./room-maintenance.component.css']
})
export class RoomMaintenanceComponent implements OnInit {
  @ViewChild(NgForm) meetingroomForm: NgForm;
  currentUser: AuthData;
  urlPath: string = '';
  isEdit: boolean = false;
  errMsg: string = "";
  errMsgPop: string = "";
  errMsgModalPop: string = "";
  isLoading: boolean = false;
  isLoadingPop: boolean = false;
  roomInfoModel = {} as RoomInformation;
  locationList = [];
  loadroomTypes: RoomType[] = [];
  roomsInfoList: RoomInformation[] = [];
  currentLocation: string;
  tableWidget: any;
  type: string = "RoomBooking";
  oldroomInfoModel = {} as RoomInformation;;// For aduit log
  auditType: string;// set ActionTypes: Create,Update,Delete
  aduitpurpose: string;
  constructor(private appService: AppComponent, private httpService: HttpService, private router: Router,
    private appServiceDate: AppService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.urlPath = this.router.url;
    var chkaccess = this.appService.validateUrlBasedAccess(this.urlPath);
    if (chkaccess == true) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.getLocationList();
      this.getRoomsTypes();
      this.getRoomfacilities();
      this.getAllrooms();
    }
  }
  //Page Load Bind Locations and Room Types...
  getLocationList() {
    this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationList = data;
        // this.currentLocation = this.getLocationName(this.currentUser.baselocation);
      }
    }).catch(error => {
      this.locationList = [];
    });
  }
  getLocationName(locId: number) {
    let temp = this.locationList.find(s => s.id == locId);
    return temp ? temp.code + '-' + temp.name : '';
  }
  getRoomsTypes() {
    this.httpService.get(APIURLS.BR_MASTER_ROOMTYPE_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.loadroomTypes = data;
      }
    }).catch(error => {
      this.loadroomTypes = [];
    });
  }
  getRoomType(rId: number) {
    let type = this.loadroomTypes.find(s => s.id == rId);
    return type ? type.type : '';
  }
  //get All Rooms and Apply filters and paging to table..
  ngAfterViewInit() {
    this.initDatatable();
  }
  private initDatatable(): void {
    var table = $('#roomsTable').DataTable(
      {
        "destroy": true,
        "columnDefs": [
          { "orderable": false, "targets": 4 }
        ]
      }
    );
    this.tableWidget = table;
  }
  private reInitDatatable(): void {
    if (this.tableWidget) {
      this.tableWidget.destroy()
      this.tableWidget = null
    }
    setTimeout(() => this.initDatatable(), 0)
  }
  getAllrooms() {
    this.isLoading = true;
    this.httpService.get(APIURLS.BR_ROOM_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        // this.roomsInfoList = data.filter(x=>x.fk_Type==1 || x.fk_Location==this.currentUser.baselocation);
        this.roomsInfoList = data.filter(x => x.fk_Location == this.currentUser.baselocation && x.isActive);
      }
      this.reInitDatatable();
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
      this.roomsInfoList = [];
    });
  }
  //Modal popup event
  onaddnewRoom(isedit: boolean, roomInformation: RoomInformation): void {
    this.isEdit = isedit;
    this.resetForm();
    this.meetingroomForm.form.markAsPristine();
    this.meetingroomForm.form.markAsUntouched();
    this.meetingroomForm.form.updateValueAndValidity();
    this.getAllroomsTypes();

    if (isedit) {
      this.oldroomInfoModel = Object.assign({}, roomInformation);
      this.roomInfoModel = Object.assign({}, roomInformation);
      this.currentLocation = this.getLocationName(this.roomInfoModel.fk_Location);
      this.getSelectedRoomTypeById(this.roomInfoModel.fk_Type);
      this.getSelectedfacilitiesById(this.roomInfoModel.id);
      this.getSelectedPicturesById(this.roomInfoModel.id);
    }
    jQuery("#myModal").modal('show');
  }
  //reset form here..
  resetForm(): void {
    this.currentLocation = this.getLocationName(this.currentUser.baselocation);
    this.roomInfoModel = {} as RoomInformation;
    this.selectedRoomType = [];
    this.selectedItems = [];
    this.images = [];
    this.allfiles = [];
    this.deletedImages = [];
    this.isRoomSelect = false;
    this.isSelect = false;
    this.hasFiles = false;
    this.errMsgPop = '';
    this.aduitpurpose = '';
    this.oldroomInfoModel = {} as RoomInformation;
  }
  //Get Selected RoomType:
  getSelectedRoomTypeById(rtyid: number): void {
    this.httpService.getById(APIURLS.BR_MASTER_ROOMTYPE_API, rtyid).then((data: any) => {
      if (data) {
        this.selectedRoomType = [data];
      }
    }).catch(error => {
      console.log('Error loading..');
    });
  }
  //Get Selected Roomfacilities:
  getSelectedfacilitiesById(rid: number): void {
    let rmFacilities = [];
    this.httpService.getById(APIURLS.BR_ROOM_FACILITIES_GetBYANY_API, rid).then((data: any) => {
      if (data) {
        this.selectedFacilities = data;
        for (let index = 0; index < this.selectedFacilities.length; index++) {
          let element = this.selectedFacilities[index];
          let facility = this.roomsFacilityList.find(x => x.id == element.fk_FacilityId);
          rmFacilities.push(facility);
        }
        this.selectedItems = rmFacilities;
      }
    }).catch(error => {
      console.log('Error loading..');
    });
  }

  //Get Selected RoomPictures:
  getSelectedPicturesById(rid: number): void {
    this.httpService.getById(APIURLS.BR_ROOM_PICTURES_GetBYANY_API, rid).then((data: any) => {
      if (data) {
        let selectedPictures = data;
        for (let i = 0; i < selectedPictures.length; i++) {
          let item = selectedPictures[i];
          const image = {
            id: 0,
            name: '',
            url: ''
          };
          image.id = item.id;
          image.name = item.fileName;
          image.url = item.path;
          this.images.push(image);
        }
      }
    }).catch(error => {
      console.log('Error loading..');
    });
  }
  //binding room facilities here..
  roomsFacilityList: RoomFacility[] = [];
  selectedItems: RoomFacility[] = [];
  selectedFacilities: Facilities[] = [];
  dropdownSettings = {};
  isSelect: boolean = false;
  getRoomfacilities() {
    this.httpService.get(APIURLS.BR_MASTER_ROOM_FACILITY_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.roomsFacilityList = data.filter(x => x.type == this.type && x.isActive).sort((a,b)=>
                                                                                      {
                                                                                        if(a.name > b.name) return 1;
                                                                                        if(a.name < b.name) return -1;
                                                                                        return 0;
                                                                                      });
      }
    }).catch(error => {
      this.roomsFacilityList = [];
    });
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
  }
  onItemDeSelect(item: any) {
    this.isSelect = true;
    // console.log(item);
  }
  onDeSelectAll(items: any) {
    this.isSelect = true;
  }
  onSelectAll(items: any) {
    this.selectedItems = items;
  }
  //Bind Room Types here
  roomTypeList: RoomType[] = [];
  selectedRoomType: RoomType[] = [];
  ddlroomTypeSettings = {};
  isRoomSelect: boolean = false;
  getAllroomsTypes() {
    this.httpService.get(APIURLS.BR_MASTER_ROOMTYPE_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.roomTypeList = data.sort((a,b)=>
                                  {
                                    if(a.type > b.type) return 1;
                                    if(a.type < b.type) return -1;
                                    return 0;
                                  });
      }
    }).catch(error => {
      this.roomTypeList = [];
    });

    this.ddlroomTypeSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'type',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
  }
  onRoomTypeSelect(item: any) {
    //console.log(item);
    this.roomInfoModel.fk_Type = item.id;
  }
  onRoomItemDeSelect(item: any) {
    this.isRoomSelect = true;
  }
  //Save and Update here
  onSaveRoomDetails(): void {
    let roomId: number;
    let connection: any;
    this.roomInfoModel.isActive = true;

    let sametype = this.roomsInfoList.some(v => v.name.toLowerCase() == this.roomInfoModel.name.toLowerCase() && v.fk_Location == this.currentUser.baselocation && v.id != this.roomInfoModel.id);
    if (sametype) {
      this.isLoadingPop = false;
      this.errMsgPop = 'Room already exists..';
    }
    else {
      if (!this.isEdit) {
        this.auditType = "Create";
        this.roomInfoModel.fk_Location = this.currentUser.baselocation;
        this.roomInfoModel.createdBy = this.currentUser.uid;
        this.roomInfoModel.createdDate = new Date().toLocaleString();
        connection = this.httpService.post(APIURLS.BR_ROOM_MASTER_API, this.roomInfoModel);
      }
      else {
        this.auditType = "Update";
        this.roomInfoModel.modifiedBy = this.currentUser.uid;
        this.roomInfoModel.modifiedDate = new Date().toLocaleString();
        roomId = this.roomInfoModel.id;
        connection = this.httpService.put(APIURLS.BR_ROOM_MASTER_API, this.roomInfoModel.id, this.roomInfoModel);
      }
      connection.then((data: any) => {
        this.isLoadingPop = false;
        if (data == 200 || data.id > 0) {
          if (!this.isEdit) {
            roomId = data.id;
          }
          this.saveRoomFacilities(this.isEdit, roomId);
          this.saveRoomPictures(this.isEdit, roomId);
          this.saveImages(roomId);
          jQuery('#myModal').modal('hide');
          this.errMsgModalPop = 'Room saved successfully!';
          jQuery("#saveModal").modal('show');
          let Id = !this.isEdit ? data.id : this.roomInfoModel.id;
          this.insertAuditLog(this.oldroomInfoModel, this.roomInfoModel, Id);
          this.getAllrooms();
        }
      }).catch(error => {
        this.isLoadingPop = false;
        this.errMsgPop = 'Error saving Room...';
      });
    }
  }

  saveRoomFacilities(isedit: boolean, rmid: number): void {
    let connection: any;
    if (isedit) {
      for (let index = 0; index < this.selectedFacilities.length; index++) {
        let fitem = this.selectedFacilities[index];
        connection = this.httpService.delete(APIURLS.BR_ROOM_FACILITIES_API, fitem.id);
        connection.then((data: any) => {
          if (data == 200 || data.id > 0) {
          }
        }).catch(error => {
          this.errMsgPop = 'Error delete Room...';
        });
      }
    }
    for (let index = 0; index < this.selectedItems.length; index++) {
      let fitem = this.selectedItems[index];
      let roomFacilitiesModel = {} as Facilities;
      roomFacilitiesModel.fk_RoomId = rmid;
      roomFacilitiesModel.fk_FacilityId = fitem.id;
      roomFacilitiesModel.createdBy = this.currentUser.uid;
      roomFacilitiesModel.createdDate = new Date().toLocaleString();
      connection = this.httpService.post(APIURLS.BR_ROOM_FACILITIES_API, roomFacilitiesModel);
      connection.then((data: any) => {
        if (data == 200 || data.id > 0) {
        }
      }).catch(error => {
        this.errMsgPop = 'Error saving Room...';
      });
    }
  }
  //Upload Images to Directory..
  images: any = [];
  allfiles: any = [];
  deletedImages: any = [];
  hasFiles: boolean = false;
  uploadFiles(event) {
    const files = event.target.files;
    // console.log(files);
    if (files.length === 0) {
      return;
    }
    if (this.validateimageSelectedOnly(files)) {
      for (let i = 0; i < files.length; i++) {
        const image = {
          id: 0,
          name: '',
          url: ''
        };
        this.allfiles.push(files[i]);
        image.name = files[i].name;
        const reader = new FileReader();
        reader.onload = (filedata) => {
          image.url = reader.result + '';
          this.images.push(image);
        }
        reader.readAsDataURL(files[i]);
      }
      event.srcElement.value = null;
    }
    this.hasFiles = true;
  }

  deleteImage(image: any) {
    if (image.id != 0) {
      this.deletedImages.push(image);
    }
    const index = this.images.indexOf(image);
    this.images.splice(index, 1);
    this.allfiles.splice(index, 1);
  }
  saveImages(id: number) {
    const formData = new FormData();
    for (let i = 0; i < this.allfiles.length; i++) {
      formData.append("files", this.allfiles[i], this.allfiles[i]['name']); //Important: formdata Name 'files'should be equal to API parameter IformData.
    }
    let connection = this.httpService.postImageFiles(APIURLS.BR_ROOM_IMAGEUPLOAD_API, formData, id);
    connection.then((data: any) => {
      if (data == 200 || data.id > 0) {
        //console.log(data);
      }
    }).catch(error => {
      //console.log(error);
      this.errMsgPop = 'Error saving Images...';
    });

  }
  validateimageSelectedOnly(filesSelected: File[]) {
    let maxSize = 2048;
    for (var i = 0; i < filesSelected.length; i++) {
      let fsize = filesSelected[i].size / 1024;
      if (fsize > maxSize) {
        alert('Maximum file size exceed, Please upload 2MB files');
        return false;
      } else {
        let allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
        if (allowedExtensions.exec(filesSelected[i].name)) {
          return true;
        }
        else {
          alert('Please select images files only!');
          return false;
        }
      }
    }
  }
  saveRoomPictures(isedit: boolean, rmid: number): void {
    let connection: any;
    if (isedit) {
      for (let index = 0; index < this.deletedImages.length; index++) {
        let fitem = this.deletedImages[index];
        connection = this.httpService.delete(APIURLS.BR_ROOM_PICTURES_API, fitem.id);
        connection.then((data: any) => {
          if (data == 200 || data.id > 0) {
          }
        }).catch(error => {
          this.errMsgPop = 'Error delete Room Pictures...';
        });
      }
    }
    for (let index = 0; index < this.images.length; index++) {
      let fitem = this.images[index];
      if (fitem.id == 0) {
        let roomPicturesModel = {} as RoomPictures;
        roomPicturesModel.fk_RoomMasterID = rmid;
        roomPicturesModel.fileName = fitem.name;
        roomPicturesModel.path = "\\MRBSImageUpload\\" + rmid + "\\" + fitem.name;
        roomPicturesModel.createdBy = this.currentUser.uid;
        roomPicturesModel.createdDate = new Date().toLocaleString();
        connection = this.httpService.post(APIURLS.BR_ROOM_PICTURES_API, roomPicturesModel);
        connection.then((data: any) => {
          if (data == 200 || data.id > 0) {
          }
        }).catch(error => {
          this.errMsgPop = 'Error saving Room Pictures...';
        });
      }
    }
  }
  //delete here
  deleteRoomDetails(roomInformation: RoomInformation): void {
    this.resetForm();
    swal({
      title: "Are you sure to delete?",
      icon: "warning",
      buttons: [true, true],
    }).then((willdelete) => {
      if (willdelete) {
        let connection: any;
        this.auditType = "Delete";
        this.roomInfoModel = Object.assign({}, roomInformation);
        this.roomInfoModel.isActive = false;
        this.roomInfoModel.modifiedBy = this.currentUser.uid;
        this.roomInfoModel.modifiedDate = new Date().toLocaleString();

        this.getSelectedfacilitiesById(this.roomInfoModel.id);
        connection = this.httpService.put(APIURLS.BR_ROOM_MASTER_API, this.roomInfoModel.id, this.roomInfoModel);
        connection.then((data: any) => {
          this.isLoadingPop = false;
          if (data == 200 || data.id > 0) {
            this.errMsgModalPop = 'Deleted successfully!';
            jQuery("#saveModal").modal('show');
            this.insertAuditLog(this.roomInfoModel, this.oldroomInfoModel, this.roomInfoModel.id);
            this.getAllrooms();
          }
        }).catch(error => {
          this.isLoadingPop = false;
          this.errMsgPop = 'Error delete Room...';
        });
      }
    });
  }
  //AuditLogging
  masterName: string = 'Room Maintenance'; // Change MasterName
  insertAuditLog(oldObj: RoomInformation, newObj: RoomInformation, id) {
    let oldObject: actionItemModel = new actionItemModel();
    let newObject: actionItemModel = new actionItemModel();
    oldObject.name = oldObj.name;
    oldObject.capacity = oldObj.capacity;
    oldObject.description = oldObj.description;
    oldObject.manager_Approval = oldObj.manager_Approval;
    oldObject.admin_Approval = oldObj.admin_Approval;
    oldObject.location = oldObj.fk_Location?this.getLocationName(oldObj.fk_Location):'';
    oldObject.type = oldObj.fk_Type?this.loadroomTypes.find(x => x.id == oldObj.fk_Type).type:'';
    let oldfacilities = '';
    this.selectedFacilities.forEach(c => {
      oldfacilities += this.roomsFacilityList.find(x => x.id == c.fk_FacilityId).name + ',';
    });
    oldObject.facilities = oldObj.fk_Type ? oldfacilities.slice(0, -1) : '';
    newObject.name = newObj.name;
    newObject.capacity = newObj.capacity;
    newObject.description = newObj.description;
    newObject.manager_Approval = newObj.manager_Approval;
    newObject.admin_Approval = newObj.admin_Approval;
    newObject.location = newObj.fk_Location?this.getLocationName(newObj.fk_Location):'';
    newObject.type = newObj.fk_Type?this.loadroomTypes.find(x => x.id == newObj.fk_Type).type:'';
    let newfacilities = '';
    this.selectedItems.forEach(c => {
      newfacilities += this.roomsFacilityList.find(x => x.id == c.id).name + ',';
    });
    newObject.facilities = newObj.fk_Type ? newfacilities.slice(0, -1) : '';

    let beforekey = Object.keys(oldObject);
    let aftrekey = Object.keys(newObject);
    var biggestKey = 0;
    if (beforekey.length > 0)
      var biggestKey = beforekey.length;
    else
      var biggestKey = aftrekey.length;
    let auditlogchangeList: AuditLogChange[] = [];
    for (var i = 0; i < biggestKey; i++) {
      if (this.auditType == "Update") {
        if (_.isEqual(beforekey[i], aftrekey[i]) && !_.isEqual(oldObject[beforekey[i]], newObject[aftrekey[i]])) {
          let auditlog: AuditLogChange = new AuditLogChange();
          auditlog.fieldname = beforekey[i];
          auditlog.oldvalue = oldObject[beforekey[i]];
          auditlog.newvalue = newObject[aftrekey[i]];
          auditlogchangeList.push(auditlog);
        }
      }
      else if (this.auditType == "Create") {
        let auditlog: AuditLogChange = new AuditLogChange();
        auditlog.fieldname = aftrekey[i];
        auditlog.oldvalue = oldObject[beforekey[i]];
        auditlog.newvalue = newObject[aftrekey[i]];
        auditlogchangeList.push(auditlog);
      }
      else if (this.auditType == "Delete") {
        let auditlog: AuditLogChange = new AuditLogChange();
        auditlog.fieldname = beforekey[i];
        auditlog.oldvalue = oldObject[beforekey[i]];
        auditlog.newvalue = newObject[aftrekey[i]];
        auditlogchangeList.push(auditlog);
      }
    }
    let connection: any;
    let auditlog: AuditLog = new AuditLog();
    auditlog.auditDateTime = new Date().toLocaleString();
    auditlog.aduitUser = this.currentUser.fullName;
    auditlog.auditType = this.auditType;
    auditlog.masterName = this.masterName;
    auditlog.tableId = id;
    auditlog.keyValue=newObj.name?newObj.name:oldObj.name;
    auditlog.changes = JSON.stringify(auditlogchangeList);
    auditlog.oldValues = JSON.stringify(oldObj);
    auditlog.newValues = JSON.stringify(newObj);
    auditlog.purpose = this.aduitpurpose;
    connection = this.httpService.post(APIURLS.BR_AUDITLOG_API, auditlog);
    connection.then((data: any) => {
      this.isLoadingPop = false;
    }).catch(() => {
      this.isLoadingPop = false;
    });
  }
  auditLogList: AuditLog[] = [];
  openAuditLogs(id) {
    jQuery("#auditModal").modal('show');
    let stringparms = this.masterName + ',' + id;
    this.httpService.getByParam(APIURLS.BR_AUDITLOG_GetBYPARAM_API, stringparms).then((data: any) => {
      if (data) {
        this.auditLogList = data;
        this.auditLogList.reverse();
      }
      this.reinitPOUPDatatable();
    }).catch(() => {
    });

  }
  objParser(val) {
    return JSON.parse(val);
  }
  public audittableWidget: any;
  private initPOUPDatatable(): void {
    let exampleId: any = jQuery('#auditTable');
    this.audittableWidget = exampleId.DataTable({
      "order": [[0, "desc"]],
      "lengthChange": false,
      "pageLength": 5,
      "searching": false,
      "columnDefs": [
        {
          render: function (data, type, full, meta) {
            return "<div style='word-break: break-all;height:7em;overflow-x:hidden;'>" + data + "</div>";
          },
          targets: 5
        }
      ]
    });
    this.isLoading = false;

  }
  private reinitPOUPDatatable(): void {
    if (this.audittableWidget) {
      this.audittableWidget.destroy();
      this.audittableWidget = null;
    }
    setTimeout(() => this.initPOUPDatatable(), 0);
  }
}
