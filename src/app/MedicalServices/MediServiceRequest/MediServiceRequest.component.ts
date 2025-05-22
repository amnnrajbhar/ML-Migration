import { AuthData } from '../../auth/auth.model'
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../shared/http-service';
import { APIURLS } from '../../shared/api-url';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import swal from 'sweetalert';
import * as _ from "lodash";
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';


declare var require: any;
declare var jQuery: any;
declare var $: any;
declare var toastr: any;

import { MediServiceRequest } from './MediServiceRequest.model';
import { ExcelService } from '../../shared/excel-service';
import { MediServiceRequestHistory } from '../MediServiceRequestHistory/MediServiceRequestHistory.model';
import { MediServiceBrand } from '../MediServiceBrand/MediServiceBrand.model';
import { DatePipe } from '@angular/common';
import * as ExcelJS from "exceljs/dist/exceljs.min.js";
import * as ExcelProper from "exceljs";
import * as fs from 'file-saver';
import { MSService } from '../../Services/ms.service';
import { MedicalReviewer } from '../../Models/medicalReviewer.model';
import { MedServiceFilterModel } from '../../Models/medServiceFilterModel.model';

@Component({
    selector: 'app-MediServiceRequest',
    templateUrl: './MediServiceRequest.component.html',
    styleUrls: ['./MediServiceRequest.component.css']
})
export class MediServiceRequestComponent implements OnInit {
    @ViewChild(MatAutocompleteTrigger, { static: false }) autocompleteTrigger: MatAutocompleteTrigger;

@ViewChild('myInput', { static: false }) myInputVariable: ElementRef;


    public tableWidget: any;
    currentUser: AuthData;

    locListCon = [];
    locListCon1 = [];

    isLoading: boolean = false;
    isGOLoading: boolean = false;
    isApproveLoading: boolean = false;
    errMsg: string = "";
    errMsg1: string = "";
    errMsg2: string = "";
    isLoadingPop: boolean = false;
    isLoadPop: boolean = false;
    errMsgPop: string = "";
    errMsgPop1: string = "";
    isEdit: boolean = false;

    formData: FormData = new FormData();
    file: File; successMsg: string = "";
    path: string = '';
    locationList: any[] = [[]];
    selectedBaseLocation: any = [];
    baseLocationnotfirst = true;

    MediServiceRequestmodel = {} as MediServiceRequest;
    MediServiceRequestmodel1 = {} as MediServiceRequest
    MediServiceRequestlist: MediServiceRequest[] = [];
    // ItemCodeExtensionlist:ItemCodeExtension[]=[];
    materialtype: string;
    today = new Date();

    // Filter variables
    // filterRequest: string = null;
    // filterProduct: string = null;
    // filterStatus: string = null;
    // filterBrand: string = null;
    // from_date: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 60);
    // to_date: any = this.today;

    filterMaterialCode: string = null;
    filterlocation: string = null;
    filterplace: string = null;
    from_date1: any = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
    //ItemCodeExtensionFilter:ItemCodeExtension[]=[];

    MediServiceRequestList: MediServiceRequest[] = [];
    MediServiceRequestsearchlist: MediServiceRequest[] = [];

    emailid: string;
    requestDate: Date;
    Approver1: boolean = false;
    Approverid1: string = "";
    Approverid2: string = "";
    Approver2: boolean = false;
    Creator: boolean = false;
    Review: boolean = false;
    Closure: boolean = false;
    userid: string;

    MedHead: string;
    MedHeadID: string;
    MedHeadList: any[] = [];
    Reviewer: string = null;
    ReviewerList: any[] = [];
    MediRequestFilter: any[] = [];
    Approves: any;
    Comments: string;

    storeData: any;
    jsonData: any;
    fileUploaded: File;
    worksheet: any;
    current: string;
    MedCode: string = null;
    //MediServiceRequestmodeldata = {} as ItemCodeExtension;

    BrandList: MediServiceBrand[] = [];
    CategoryList: any[] = [];
    locationAllList: any[] = [[]];

    statuslist: any[] = [
        { id: 0, name: 'Submitted' },
        { id: 1, name: 'In Process' },
        { id: 2, name: 'Rejected' },
        { id: 3, name: 'Completed' },
    ];

    CodeDetails: any = {};
    validity: any = null;
    
    MediServiceRequestList1: MediServiceRequest[] = [];
    
    Head: boolean = false;
    id: string;

    transactionslist: MediServiceRequestHistory[] = [];
    transactionslist1: any[] = [];
    
    Approverslist: any[] = [];
    accountGroupList: any[] = [];
    Aprlpriority: number;
    ApprovingManager: any;
    
    empId: string;
    view: boolean = false;
    locationName: string;
    attachments: string[] = [];
    
    Role: string;
    currentStage: any;
    mailbody: any;

    isMasterSel: boolean = false;
    isLoadingReq: boolean = false;
    
    checkedRequestList: MediServiceRequest[] = [];
    checkedlist: MediServiceRequest[] = [];
    
    fileToUpload: File | null = null;
    File: File | null = null;
    name: string;
    files: File[] = [];
    totalFileSize: number = 0;
    totalFileSizeInMB: number = 0;
    fileSizePercentage: number = 0;
    
    isValid: boolean = false;
    validatedForm: boolean = true;
    
    fileNamesList: any[] = [];
    filesList: File[] = [];
    
    MasterDumpData: any[] = [];
    exportList: any[];

    constructor(private appService: AppComponent, private httpService: HttpService, private datePipe: DatePipe, private router: Router, private excelService: ExcelService, private msService: MSService) { }

    private initDatatable(): void {
        let exampleId: any = jQuery('#userTable');
        this.tableWidget = exampleId.DataTable({
            "order": []
        });
    }

    private reInitDatatable(): void {
        if (this.tableWidget) {
            this.tableWidget.destroy()
            this.tableWidget = null
        }
        setTimeout(() => this.initDatatable(), 0)
    }

    ngOnInit() {
        this.path = this.router.url;
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        //  this.baseLocation = this.currentUser.baselocation;
        this.emailid = this.currentUser.email;
        this.userid = this.currentUser.employeeId;
        this.current = this.currentUser.employeeId + ' - ' + this.currentUser.fullName;
        //this.requestdate = new Date(this.today);
        // this.filterStatus = null;
        // this.filterlocation = this.currentUser.baselocation.toString();
        var chkaccess = this.appService.validateUrlBasedAccess(this.path);
        // if (chkaccess == true) {
        this.Approves = 'Approve';
        this.getAllEntries();
        this.getLocationMaster();
        this.getBrandList();
        this.getCategoryList();
        this.GetMedHeadList();
        // this.GetReviewersList(this.currentUser.employeeId);
        this.GetMediServiceMasterDump();
        // }
        // else
        //  this.router.navigate(["/unauthorized"]);

        // Removes the padding that is added when a modal is closed.
        $(document.body).on('hidden.bs.modal', function () {
            $('body').css('padding-right','0');
        });
    }

    ngAfterViewInit() {
        this.initDatatable();
    }

    getBrandList() {
        this.httpService.get(APIURLS.BR_MED_SERVICE_BRAND_API).then((data: any) => {
            if (data.length > 0) {
                this.BrandList = data;
                let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
                this.BrandList.sort((a, b) => { return collator.compare(a.brandDesc, b.brandDesc) });

            }
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.BrandList = [];
        });

    }
    
    getCategoryList() {
        this.httpService.get(APIURLS.BR_MED_SERVICE_CATEGORY_API).then((data: any) => {
            if (data.length > 0) {
                this.CategoryList = data;
                let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
                this.CategoryList.sort((a, b) => { return collator.compare(a.category, b.category) });

            }
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.CategoryList = [];
        });

    }

    getLocation(id) {
        let temp = this.locationList.find(e => e.id == id);
        return temp ? temp.code : '';
    }

    getloc(loc) {
        let loccode = loc.keyValue.split('~');
        return loccode ? loccode[0] : '';
    }

    getDateFormate(date: any): string {
        let d1 = new Date(date);
        return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
            ("00" + d1.getDate()).slice(-2);
    }

    getFormatedDateTime(date: any) {
        let dt = new Date(date);
        let formateddate = dt.getFullYear() + "-" + ("00" + (dt.getMonth() + 1)).slice(-2) + "-" +
            ("00" + dt.getDate()).slice(-2);
        return formateddate;
    }

    clearFilter() {
        // Reset the filters
        this.msService.from_date = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() - 30);
        this.msService.to_date = this.today;
        this.msService.filterStatus = null;
        this.msService.filterRequest = null;
        this.msService.filterProduct = null;
        this.msService.filterBrand = null;

        // this.Approves = "Approve";
        // this.filterlocation = null;
        // this.filterplace = null;

        // this.checkedRequestList = [];
    }

    GetData(code) {
        this.httpService.getByParam(APIURLS.BR_MED_SERVICE_MEDCODE_DETAILS_API, code).then((data: any) => {
            this.isLoading = true;
            if (data.type == 'E') {
                swal({
                    title: "Message",
                    text: data.message,
                    icon: "warning",
                    dangerMode: false,
                    buttons: [false, true]
                })
            }
            else {
                this.CodeDetails = data;
                this.MediServiceRequestmodel.category = this.CodeDetails.category;
                this.MediServiceRequestmodel.brand = this.CodeDetails.brand;
                this.MediServiceRequestmodel.product = this.CodeDetails.product;
                this.MediServiceRequestmodel.details = this.CodeDetails.details;
                this.MediServiceRequestmodel.repeatFlag = this.CodeDetails.repeatFlag;
                this.validity = data.finalDocDate;
            }
            //this.reInitDatatable();
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.Approverslist = [];
        });
    }

    getAllEntries() {
        this.isLoading = true;
        this.isGOLoading = true;
        let td = new Date();
        this.MediServiceRequestList1 = [];
        let formatedFROMdate: string;
        let formatedTOdate: string;
        let filterModel: MedServiceFilterModel = {} as MedServiceFilterModel;
        this.checkedRequestList = [];

        if (this.msService.from_date == '' || this.msService.from_date == null) {
            formatedFROMdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" + "01";
            this.msService.from_date = new Date(td.getFullYear(), td.getMonth(), 1);
        } else {
            let fd = new Date(this.msService.from_date);
            formatedFROMdate = fd.getFullYear() + "-" + ("00" + (fd.getMonth() + 1)).slice(-2) + "-" +
                ("00" + fd.getDate()).slice(-2);
            this.msService.from_date = new Date(fd.getFullYear(), fd.getMonth(), fd.getDate());
        }

        if (this.msService.to_date == '' || this.msService.to_date == null) {
            formatedTOdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" +
                ("00" + td.getDate()).slice(-2);
            this.msService.to_date = new Date(td.getFullYear(), td.getMonth(), +("00" + td.getDate()).slice(-2), 23, 59);
        } else {
            let ed = new Date(this.msService.to_date);
            formatedTOdate = ed.getFullYear() + "-" + ("00" + (ed.getMonth() + 1)).slice(-2) + "-" +
                ("00" + ed.getDate()).slice(-2);
            this.msService.to_date = new Date(ed.getFullYear(), ed.getMonth(), +("00" + ed.getDate()).slice(-2), 23, 59);
        }

        filterModel.fromDate = this.getFormatedDateTime(this.msService.from_date);
        filterModel.toDate = this.getFormatedDateTime(this.msService.to_date);
        filterModel.requestNo = this.msService.filterRequest;
        filterModel.employee = this.currentUser.employeeId;
        filterModel.brand = this.msService.filterBrand;
        filterModel.status = this.msService.filterStatus == 'Pending' ? 'In Process,Submitted' : this.msService.filterStatus;
        filterModel.product = this.msService.filterProduct;
        // filterModel.pageSize = this.msService.pageSize;
        // filterModel.pageNumber = this.msService.pageNumber;

        this.httpService.post(APIURLS.BR_MED_SERVICE_REQUEST_FILTER_API, filterModel).then((data: MediServiceRequest[]) => {
            if (data) {
                if (this.msService.filterStatus == null && (this.msService.filterRequest == null || this.msService.filterRequest == '')) {
                    var createdBy = this.currentUser.employeeId + ' - ' + this.currentUser.fullName;

                    this.MediServiceRequestList = data.filter(x => x.pendingApprover == this.currentUser.fullName || x.pendingApprover == this.currentUser.employeeId || x.createdBy.includes(this.currentUser.employeeId) 
                        || x.createdBy == this.currentUser.employeeId);
                    this.MediServiceRequestList.reverse();

                    this.MediServiceRequestList1 = data.filter(x => x.pendingApprover == this.currentUser.fullName || x.pendingApprover == this.currentUser.employeeId || x.createdByDisplay == createdBy 
                        || x.createdBy == this.currentUser.employeeId);
                    this.MediServiceRequestList1.reverse();

                    if (this.Approves == "Approve" && this.Head == true) {
                        this.MediServiceRequestList = this.MediServiceRequestList.filter(x => x.reviewerAssignFlag == 1);
                    }
                } else {
                    this.MediServiceRequestList = data;
                    this.MediServiceRequestList.reverse();
                    this.MediServiceRequestList1 = data;
                    this.MediServiceRequestList1.reverse();
                    if (this.Approves == "Approve" && this.Head == true) {
                        this.MediServiceRequestList = this.MediServiceRequestList1.filter(x => x.reviewerAssignFlag == 1);
                    }
                }

                // this.msService.totalCount = data[0].totalCount;
                // this.msService.totalPages = data[0].totalPages;
                
                // this.MediServiceRequestlist = this.MediServiceRequestlist.sort((a, b) => {
                //     if (a.approveType != 'Submitted' && a.pendingApprover == 'No' && a.stage == '0' && (a.createdByDisplay == this.current || a.createdBy == this.currentUser.employeeId)) { return 1; }
                //     else { return -1; }
                // });
                // this.MediServiceRequestList1 = this.MediServiceRequestList1.sort((a, b) => {
                //     if (a.approveType != 'Submitted' && a.pendingApprover == 'No' && a.stage == '0' && (a.createdByDisplay == this.current || a.createdBy == this.currentUser.employeeId)) { return 1; }
                //     else { return -1; }
                // });
            }

            if (this.currentUser.employeeId == this.MedHeadID) {
                this.GetRequest(this.Approves);
            } else {
                this.GetRequest("");
            }

            this.checkedRequestList = [];
            // this.reInitDatatable();
            this.isLoading = false;
            this.isGOLoading = false;
        }).catch(error => {
            swal("Error", "Error fetching Medical Service Requests. Please check the console for error details.", "error");
            console.log(error);
            this.isLoading = false;
            this.isGOLoading = false;
            this.MediServiceRequestList = [];
            this.checkedRequestList = [];
        });
    }

    // Pagination Functions
    // gotoPage(no) {
	// 	if (this.msService.pageNumber == no) return;
	// 	this.msService.pageNumber = no;
	// 	this.getAllEntries();
	// }

	// pageSizeChange() {
	// 	this.msService.pageNumber = 1;
	// 	this.getAllEntries();
	// }

    isRequestPendingWithUser(item: MediServiceRequest): boolean {
        if (item.approveType != 'Submitted'&& item.pendingApprover == 'No' && item.stage == '0' && (item.createdByDisplay == this.current || item.createdBy == this.currentUser.employeeId)) {
            return true;
        }

        return false;
    }

    onApproveAssignChange(value: string) {
        // Clear the reviewer
        this.Reviewer = null;

        // Uncheck all entries
        this.isMasterSel = false;
        this.checkUncheckAll();
        
        // Clear the checked requests list
        this.checkedRequestList = [];

        // Refresh the request list
        this.GetRequest(value);
    }

    GetRequest(value: string) {
        if (value == "Approve") {
            this.MediServiceRequestList = this.MediServiceRequestList1.filter(x => x.reviewerAssignFlag == 1 || (this.MedHeadID == this.currentUser.employeeId && x.pendingApprover != this.MedHeadID));
        } else if (value == "Assign") {
            this.MediServiceRequestList = this.MediServiceRequestList1.filter(x => (x.reviewerAssignFlag == 0 || x.reviewerAssignFlag == null) && x.stage == '1' && x.approveType != 'Rejected' && x.inputType == 'scientific');
        }

        this.reInitDatatable();
    }

    changeValues(value) {
        this.MediServiceRequestmodel.category = null;
        this.MediServiceRequestmodel.product = null;
        this.MediServiceRequestmodel.details = null;
        this.MediServiceRequestmodel.brand = null;
        this.MedCode = null;
    }

    getLocationMaster() {
        this.httpService.get(APIURLS.BR_MASTER_LOCATION_MASTER_ALL_API).then((data: any) => {
            if (data.length > 0) {
                this.locationAllList = data;
                this.locationList = data.filter(x => x.isActive);
                let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
                this.locationList.sort((a, b) => { return collator.compare(a.code, b.code) });
                this.locListCon = data.map((x) => { x.name1 = x.code + '-' + x.name; return x; });
                this.locListCon.sort((a, b) => { return collator.compare(a.code, b.code) });
            }
        }).catch(error => {
            this.isLoading = false;
            this.locationList = [];
        });
    }

    GetReviewersList(empId) {
        this.httpService.post(APIURLS.BR_MED_HEAD_REVIEWERS_LIST_API, empId).then((data: MedicalReviewer[]) => {
            if (data.length > 0) {
                this.ReviewerList = data;
            }
        }).catch(error => {
            swal("Error", "Error fetching the reviewers list. Please check the console for error details.", "error");
            console.log(error);
            this.isLoading = false;
            this.ReviewerList = [];
        });
    }

    GetMedHeadList() {
        this.httpService.get(APIURLS.BR_MED_HEAD_APPROVERS_LIST_API).then((data: any) => {
            if (data.length > 0) {
                this.MedHeadList = data;
                this.MedHead = this.MedHeadList.find(x => x.role == "Med_Head").name;
                this.MedHeadID = this.MedHeadList.find(x => x.role == "Med_Head").employeeId;

                var temp = this.MedHeadList.find(x => x.employeeId == this.currentUser.employeeId);
                temp ? this.Head = true : this.Head = false;

                if (this.Head) {
                    this.Approves = 'Approve';
                    this.GetRequest(this.Approves);
                    this.GetReviewersList(this.currentUser.employeeId);
                }
            }
        }).catch(error => {
            swal("Error", "Error fetching Medical Head data. Please check the console for error details.", "error");
            console.log(error);
            this.isLoading = false;
            this.MedHeadList = [];
            this.MedHead = "";
        });
    }

    handleFileInput(files: FileList) {
        this.errMsg1 = "";
        this.errMsg2 = "";
        this.File = files[0];

        // Total File Size validation
        if (this.totalFileSize + this.File.size > this.msService.maxFileSize) {
            swal("Message", "Cannot exceed maximum attachment size of " + this.msService.maxFileSizeText + ".", "warning");
            
            this.File = null;
            this.reset();

            return;
        }

        // File name validation
        if (this.files.find(x => x.name == this.File.name) || this.attachments.find(x => x == this.File.name)) {
            swal("Message", "A file with the same name is already attached. Please choose a different file.", "warning");

            this.File = null;
            this.reset();

            return;
        }

        // Special character validation
        if (!this.msService.checkSpecialCharactersInFileName(this.File.name)) {
            swal("Message", "Filenames cannot have the following special characters: @, !, #, \$, %, \^, *, +, =, \{, \}, \?, \&, \| and comma (,). Please remove them from " + this.File.name + " before uploading it.", "warning");
            
            this.File = null;
            this.reset();

            return;
        }
        
        this.totalFileSize += this.File.size;
        this.totalFileSizeInMB = this.totalFileSize / 1000000;
        this.fileSizePercentage = (this.totalFileSize / this.msService.maxFileSize) * 100;

        for (var i = 0; i < files.length; i++) {
            this.files.push(files[i]);
        }

        this.validateAttachment();
        // this.files=[];

        this.reset();
    }

    ReadAsBase64(file): Promise<any> {
        const reader = new FileReader();
        const fileValue = new Promise((resolve, reject) => {
            reader.addEventListener('load', () => {
                const result = reader.result as string;
                if (!result) reject('Cannot read variable');
                if (result.length * 2 > 2 ** 23) reject('File exceeds the maximum size'); // Note: 2*2**20 = 2**21
                resolve(reader.result);
            });

            reader.addEventListener('error', event => {
                reject(event);
            });

            reader.readAsDataURL(file);
        });

        return fileValue;
    }

    uploadFiles() {
        this.formData = new FormData();
        for (var i = 0; i < this.filesList.length; i++) {
            this.formData.append('files', this.filesList[i]);
        }

        let connection: any;
        connection = this.httpService.fileUpload(APIURLS.BR_MASTER_MED_FILEUPLOAD_API, this.id, this.formData);
        connection.then((data: any) => {
            this.isLoading = false;
            if (data == 200) {
                console.log("Uploaded files to server");
            } else {
                // swal("Error", data.error, "error");
            }
        }).catch(error => {
            this.errMsgPop = "Error uploading files. Please check the console for error details.";
            console.log(error);
        });
    }

    resetForm() {
        this.errMsg1 = "";
        this.MediServiceRequestmodel = {} as MediServiceRequest;
        this.MediServiceRequestmodel1 = {} as MediServiceRequest;
        this.Comments = "";
        this.MedCode = null;
    }

    gettransactions(reqNo) {
        this.httpService.getByParam(APIURLS.BR_MED_SERVICE_HISTORY_API, reqNo).then((data: any) => {
            this.isLoading = true;

            if (data.length > 0) {
                this.transactionslist = data;

                if (this.MediServiceRequestmodel.reviewerAssignFlag = 1) {
                    let pendingReviewer = this.transactionslist.filter(x => x.role == 'REVIEWER' && x.doneOn);

                    if (pendingReviewer && pendingReviewer.length > 0) {
                        this.Reviewer = pendingReviewer[pendingReviewer.length - 1].doneBy;

                        console.log(pendingReviewer);
                        console.log(this.Reviewer);
                    }
                }
                //this.transactionslist.reverse();
            }

            //this.reInitDatatable();
            this.isLoading = false;
        }).catch(error => {
            console.log(error);
            this.isLoading = false;
            this.transactionslist = [];
        });

    }

    getApproversList(value) {
        this.httpService.post(APIURLS.BR_MED_SERVICE_REQUEST_APPROVER_API, value).then((data: any) => {
            this.isLoading = true;
            if (data.employeeId > 0) {
                this.ApprovingManager = data;
                this.Approverslist.push(data);
                this.Approverslist.forEach(element => {
                    element.type = "Approving Manager";
                });
                //this.transactionslist.reverse();
            }
            //this.reInitDatatable();
            this.isLoading = false;
        }).catch(error => {
            console.log(error);
            this.isLoading = false;
            this.Approverslist = [];
        });

    }

    reset() {
        if (this.myInputVariable != null || this.myInputVariable != undefined) {
            this.myInputVariable.nativeElement.value = "";
        }
    }

    validateAttachment() {
        this.fileNamesList = [];
        if (this.attachments.length > 0) {
            for (let i = 0; i < this.attachments.length; i++) {
                for (let j = 0; j < this.files.length; j++) {
                    if (this.files[j].name == this.attachments[i]) {

                        swal({
                            title: "Message",
                            text: "file with name " + (this.files[j].name) + " already Exists",
                            icon: "warning",
                            dangerMode: false,
                            buttons: [false, true]
                        })
                        this.files.splice(j, 1);

                    }
                }
            }
        }

        // this.formData =  new  FormData();
        for (var i = 0; i < this.files.length; i++) {
            //this.formData.append('files',this.files[i]);
            if (this.files[i].name != null || this.files[i].name) {
                this.fileNamesList.push(this.files[i].name);
            }
            this.filesList.push(this.files[i]);
        }

        this.errMsg1 = "File Uploaded Successfully";
        // this.ReadAsBase64(this.File)
        //   .then(result => {
        //     this.fileToUpload = result;
        //   })
        //   .catch(err => this.errMsg2 = err);
        //   if(this.errMsg2.length>0)
        //   {
        //     swal({
        //       title: "Message",
        //       text: this.errMsg2,
        //       icon: "warning",
        //       dangerMode: false,
        //       buttons: [false, true]
        //     })
        //     this.errMsg1='';
        //     var index=this.fileNamesList.indexOf(this.File.name);
        //     this.fileNamesList.splice(index, 1);
        //     var index1=this.files.indexOf(this.File)
        //     this.files.splice(index1, 1);
        //     var index3=this.attachments.indexOf(this.File.name);
        //     this.attachments.splice(index3, 1);
        //   }
    }

    onCreateNewRequest() {
        this.onUserActions(false, {} as MediServiceRequest, false, '');
    }

    currentReviewerAssignFlag: number;
    onUserActions(isedit: boolean, MediServiceRequest: MediServiceRequest, isprint: boolean, value: string) {
        this.isEdit = isedit;
        this.resetForm();
        this.view = false;
        this.MedCode = null;
        this.errMsg1 = "";
        this.errMsgPop = "";
        this.transactionslist = [];
        this.Approverslist = [];
        this.ReviewerList = [];
        this.attachments = [];
        this.fileNamesList = [];
        this.files = [];
        this.filesList = [];
        this.Reviewer = null;
        this.isLoadingReq = false;
        this.totalFileSize = 0;
        this.requestDate = null;
        //this.reset();

        // this.dataForm.form.markAsPristine();
        // this.dataForm.form.markAsUntouched();
        // this.dataForm.form.updateValueAndValidity();
        if (isedit) {
            //   this.getApproversList(ItemCodeExtension);
            //this.getApproversList(MediServiceRequest);
            
            if (MediServiceRequest.attachements != null || MediServiceRequest.attachements != undefined) {
                var attachs = MediServiceRequest.attachements.split(',');
                for (let i = 0; i < attachs.length; i++) {
                    if (attachs[i] != 'null' && attachs[i] != 'undefined') {
                        this.attachments.push(attachs[i]);
                    }
                }
            }

            if (this.Head) {
                this.GetReviewersList(this.currentUser.employeeId);
            }

            this.MediServiceRequestmodel = Object.assign({}, MediServiceRequest);

            this.gettransactions(this.MediServiceRequestmodel.requestNo);
            // let emp = this.MediServiceRequestmodel.createdByDisplay.split('-');
            this.getApproversList(this.MediServiceRequestmodel.createdBy)
        } else if (!isedit && MediServiceRequest.stage == '0') {
            this.MediServiceRequestmodel = Object.assign({}, MediServiceRequest);

            if (MediServiceRequest.attachements != null || MediServiceRequest.attachements != undefined) {
                var attachs = MediServiceRequest.attachements.split(',');
                for (let i = 0; i < attachs.length; i++) {
                    if (attachs[i] != 'null' && attachs[i] != 'undefined') {
                        this.attachments.push(attachs[i]);
                    }

                }
            }

            // this.MediServiceRequestmodel = {} as MediServiceRequest;
            this.getApproversList(this.currentUser.employeeId)
            this.MediServiceRequestmodel.createdBy = this.currentUser.employeeId;
            this.MediServiceRequestmodel.createdByDisplay = this.currentUser.employeeId + ' - ' + this.currentUser.fullName;
            this.MediServiceRequestmodel.fullName = this.currentUser.fullName;
            this.MediServiceRequestmodel.location = this.locListCon.find(x => x.id == this.currentUser.baselocation).code;
            this.MediServiceRequestmodel.designation = this.currentUser.designation;
            this.MediServiceRequestmodel.department = this.currentUser.department;
            this.MediServiceRequestmodel.division = this.currentUser.division;
            this.requestDate = new Date(MediServiceRequest.requestDate);
            this.gettransactions(this.MediServiceRequestmodel.requestNo);
        } else {
            if (MediServiceRequest.attachements != null || MediServiceRequest.attachements != undefined) {
                var attachs = MediServiceRequest.attachements.split(',');

                for (let i = 0; i < attachs.length; i++) {
                    if (attachs[i] != 'null' && attachs[i] != 'undefined') {
                        this.attachments.push(attachs[i]);
                    }
                }
            }
            this.MediServiceRequestmodel = {} as MediServiceRequest;
            this.attachments = [];
            this.fileNamesList = [];

            this.getApproversList(this.currentUser.employeeId);
            this.MediServiceRequestmodel.createdBy = this.currentUser.employeeId;
            this.MediServiceRequestmodel.createdByDisplay = this.currentUser.employeeId + ' - ' + this.currentUser.fullName;
            this.MediServiceRequestmodel.fullName = this.currentUser.fullName;
            this.MediServiceRequestmodel.location = this.locListCon.find(x => x.id == this.currentUser.baselocation).code;
            this.MediServiceRequestmodel.designation = this.currentUser.designation;
            this.MediServiceRequestmodel.department = this.currentUser.department;
            this.MediServiceRequestmodel.division = this.currentUser.division;
            // this.MediServiceRequestmodel.requestDate = new Date().toLocaleString();
            // this.gettransactions(this.MediServiceRequestmodel.requestNo);
        }

        if (value == 'View') {
            this.Approver1 = true;
            this.Creator = true;
            this.view = true;
        }

        this.currentReviewerAssignFlag = this.MediServiceRequestmodel.reviewerAssignFlag;

        jQuery("#searchModal").modal('hide');
        jQuery('#myModal').modal('show');
    }

    onSaveEntry(status) {
        this.errMsg = "";
        let connection: any;

        if (this.Approverslist.length == 0) {
            swal({
                title: "Message",
                text: "Approvers are not defined for this type",
                icon: "warning",
                dangerMode: false,
                buttons: [false, true]
            });
        }
        else if (this.MediServiceRequestmodel.inputType == 'repeat' && this.validity == null) {
            swal({
                title: "Message",
                text: "Please fetch the med code details",
                icon: "warning",
                dangerMode: false,
                buttons: [false, true]
            });
        }
        else {
            if (!this.isEdit) {
                this.MediServiceRequestmodel.createdBy = this.currentUser.employeeId;
                this.MediServiceRequestmodel.createdByDisplay = this.currentUser.employeeId + ' - ' + this.currentUser.fullName;
                // this.MediServiceRequestmodel.createdDate = new Date().toLocaleString();
                // this.MediServiceRequestmodel.submitedDate = new Date().toLocaleString();
                this.MediServiceRequestmodel.pendingApprover = this.ApprovingManager.employeeId;
                this.MediServiceRequestmodel.pendingApproverName = this.ApprovingManager.fullName;
                this.MediServiceRequestmodel.lastApprover = 'No';
                this.MediServiceRequestmodel.stage = '0';
                this.MediServiceRequestmodel.approveType = "Submitted";

                if (this.fileNamesList != null || this.fileNamesList != undefined) {
                    // let file:any='';
                    let file: any = this.fileNamesList[0];
                    for (let i = 1; i < this.fileNamesList.length; i++) {
                        file = this.fileNamesList[i] + ',' + file;
                    }
                    this.MediServiceRequestmodel.attachements = file;
                }
                this.MediServiceRequestmodel.approveType = status == "Submit" ? "Submitted" : "Created";
                connection = this.httpService.post(APIURLS.BR_MED_SERVICE_REQUEST_INSERT_API, this.MediServiceRequestmodel);
            }

            connection.then((data: any) => {
                this.isLoadingPop = false;
                if (data == 200 || data.id > 0) {
                    this.id = data.requestNo;
                    data.penApproverId = this.ApprovingManager.employeeId;

                    this.uploadFiles();

                    jQuery("#myModal").modal('hide');
                    this.errMsgPop1 = 'Request ' + '' + data.requestNo + '' + ' Submitted Successfully!';
                    jQuery("#saveModal").modal('show');

                    this.getAllEntries();
                    this.reset();
                    this.resetForm();
                    // this.sendMailtoApprover(data);
                }
            }).catch(error => {
                this.isLoadingPop = false;

                swal("Error", "Error occurred while submitting request. Please check the console for error details.", "error");
                this.errMsgPop = "Error saving Request. Please check the console for error details. ";
                console.log(error);

                jQuery("#myModal").modal('hide');
                this.getAllEntries();
                this.reset();
                this.resetForm();
            });
        }
    }

    onSubmitEntry(MediServiceRequest: MediServiceRequest) {
        this.MediServiceRequestmodel = {} as MediServiceRequest;
        this.MediServiceRequestmodel = Object.assign({}, MediServiceRequest);
        this.errMsg = "";
        let connection: any;

        if (this.fileNamesList != null || this.fileNamesList != undefined) {
            for (let i = 0; i < this.fileNamesList.length; i++) {
                this.MediServiceRequestmodel.attachements = this.MediServiceRequestmodel.attachements + ',' + this.fileNamesList[i];
            }
        }

        this.MediServiceRequestmodel.pendingApprover = this.ApprovingManager.employeeId;
        this.MediServiceRequestmodel.lastApprover = this.currentUser.fullName;
        this.MediServiceRequestmodel.modifiedBy = this.currentUser.employeeId;
        this.MediServiceRequestmodel.comments = this.Comments;

        connection = this.httpService.put(APIURLS.BR_MED_SERVICE_REQUEST_INSERT_API, this.MediServiceRequestmodel.id, this.MediServiceRequestmodel);
        connection.then((data: any) => {
            this.isLoadingPop = false;
            if (data == 200 || data.id > 0) {
                this.id = this.MediServiceRequestmodel.requestNo;

                this.uploadFiles();

                jQuery("#myModal").modal('hide');
                this.errMsgPop1 = 'Request ' + '' + this.MediServiceRequestmodel.requestNo + '' + ' submitted successfully!';
                jQuery("#saveModal").modal('show');

                // If the request was reverted to the initiator, insert a transaction
                // if (this.MediServiceRequestmodel.lastApprover != 'No' || this.MediServiceRequestmodel.lastApprover != null) {
                //     this.Inserttransactions(this.MediServiceRequestmodel, "Submitted", "0");
                // }

                this.getAllEntries();
                this.reset();
                this.resetForm();
                // this.sendMailtoApprover(this.MediServiceRequestmodel);
            }
        }).catch(error => {
            this.isLoadingPop = false;

            swal("Error", "Error occurred while submitting request. Please check the console for error details.", "error");
            this.errMsgPop = 'Error Submitting Request: ' + this.MediServiceRequestmodel.requestNo;
            console.log(error);

            jQuery("#myModal").modal('hide');
            this.getAllEntries();
            this.reset();
            this.resetForm();
        });
    }

    onClickSubmit(submitType: string, request: MediServiceRequest) {
        swal({
            title: "Are you sure you want to submit?",
            text: "Please ensure all the attachments are closed before submitting the request to avoid any issues during file upload.",
            buttons: [true, "Yes"],
            dangerMode: true,
        }).then((okClicked) => {
            if (okClicked) {
                this.validateUploads(submitType, request);
            }
        });
    }

    validateUploads(submitType: string, request: MediServiceRequest) {
        const validationPromises: Promise<File>[] = [];

        // Validate each file before uploading
        this.filesList.forEach(file => {
            validationPromises.push(this.validateFile(file));
        });

        Promise.all(validationPromises).then(() => {
            if (submitType == "onSaveEntry") {
                this.onSaveEntry("Submit");
            } else {
                this.onSubmitEntry(request);
            }
        });
    }

    validateFile(file: File): Promise<File> {
        return new Promise<File>((resolve, reject) => {
            const reader = new FileReader();
    
            reader.readAsArrayBuffer(file.slice(0, 10)); // Read the first 10 bytes for validation
    
            reader.onload = () => {
                resolve(file); // Resolve the promise with the file if it's accessible
            };
    
            reader.onerror = () => {
                this.removefile(file.name);
                this.filesList.splice(this.filesList.indexOf(file), 1);
                
                let errorMessage = `The file "${file.name}" might be open or locked by another process. Please close it and try again.`;
                swal("File Open In Another Process", errorMessage, "error");
                reject(new Error(errorMessage));
            };
        });
    }

    onReview(status) {
        this.errMsg = "";
        let connection: any;
        this.isApproveLoading = true;
        this.currentStage = this.MediServiceRequestmodel.stage;

        if (status == "Rejected") {
            this.MediServiceRequestmodel.pendingApprover = 'No';
            this.MediServiceRequestmodel.approveType = "Rejected";
            this.MediServiceRequestmodel.rejectedFlag = '1';
        } else {
            if (this.MediServiceRequestmodel.inputType != 'scientific') {
                if (this.MediServiceRequestmodel.stage == '0') {
                    this.MediServiceRequestmodel.pendingApprover = this.MedHeadID;
                    this.MediServiceRequestmodel.pendingApproverName = this.MedHead;
                    this.MediServiceRequestmodel.stage = '4';
                    this.MediServiceRequestmodel.approveType = "In Process";
                    this.MediServiceRequestmodel.reviewerAssignFlag = 1;
                } else {
                    this.MediServiceRequestmodel.pendingApprover = 'No';
                    this.MediServiceRequestmodel.stage = '5';
                    this.MediServiceRequestmodel.approveType = "Completed";
                }
            } else {
                if (this.MediServiceRequestmodel.stage == '0') {
                    console.log("Stage 0");
                    this.MediServiceRequestmodel.pendingApprover = this.MedHeadID;
                    this.MediServiceRequestmodel.pendingApproverName = this.MedHead;
                    this.MediServiceRequestmodel.stage = '1';
                    this.MediServiceRequestmodel.approveType = "In Process";
                    this.MediServiceRequestmodel.reviewerAssignFlag = 0;
                } else if (this.MediServiceRequestmodel.stage == '1' && this.currentReviewerAssignFlag != 1) {
                    console.log("Stage 1 & ReviewerAssignFlag != 1");
                    this.MediServiceRequestmodel.pendingApprover = this.Reviewer;
                    this.MediServiceRequestmodel.pendingApproverName = this.ReviewerList.find(x => x.employeeId == this.Reviewer).fullName;
                    this.MediServiceRequestmodel.stage = '2';
                    this.MediServiceRequestmodel.approveType = "In Process";
                    this.MediServiceRequestmodel.reviewerAssignFlag = 1;
                } else if (this.MediServiceRequestmodel.stage == '1' && this.currentReviewerAssignFlag == 1) {
                    console.log("Stage 1 & ReviewerAssignFlag = 1");
                    let temp = this.transactionslist.find(x => x.requestNo == this.MediServiceRequestmodel.requestNo && x.role == 'REVIEWER');
                    this.MediServiceRequestmodel.pendingApprover = temp ? temp.doneBy : this.Reviewer;
                    this.MediServiceRequestmodel.pendingApproverName = temp ? temp.approverName : this.ReviewerList.find(x => x.employeeId == this.Reviewer).fullName;
                    this.MediServiceRequestmodel.stage = '2';
                    this.MediServiceRequestmodel.approveType = "In Process";
                    this.MediServiceRequestmodel.reviewerAssignFlag = 1;
                } else if (this.MediServiceRequestmodel.stage == '2') {
                    console.log("Stage 2");
                    let temp = this.transactionslist.find(x => x.requestNo == this.MediServiceRequestmodel.requestNo && x.approvalPriority == 1);
                    this.MediServiceRequestmodel.pendingApprover = temp.doneBy;
                    this.MediServiceRequestmodel.pendingApproverName = temp.approverName;
                    this.MediServiceRequestmodel.stage = '3';
                    this.MediServiceRequestmodel.approveType = "In Process";
                } else if (this.MediServiceRequestmodel.stage == '3') {
                    console.log("Stage 3");
                    let temp = this.transactionslist.find(x => x.requestNo == this.MediServiceRequestmodel.requestNo && x.approvalPriority == 2);
                    this.MediServiceRequestmodel.pendingApprover = temp.doneBy;
                    this.MediServiceRequestmodel.pendingApproverName = temp.approverName;
                    this.MediServiceRequestmodel.stage = '4';
                    this.MediServiceRequestmodel.approveType = "In Process";
                } else if (this.MediServiceRequestmodel.stage == '4') {
                    console.log("Stage 4");
                    this.MediServiceRequestmodel.pendingApprover = 'No';
                    this.MediServiceRequestmodel.stage = '5';
                    this.MediServiceRequestmodel.approveType = "Completed";
                }
            }
        }

        this.MediServiceRequestmodel.lastApprover = this.currentUser.fullName;
        this.MediServiceRequestmodel.modifiedBy = this.currentUser.employeeId;
        this.MediServiceRequestmodel.approverId = this.currentUser.employeeId;
        this.MediServiceRequestmodel.status = status;
        this.MediServiceRequestmodel.comments = this.Comments;

        connection = this.httpService.put(APIURLS.BR_MED_SERVICE_REQUEST_INSERT_API, this.MediServiceRequestmodel.id, this.MediServiceRequestmodel);
        connection.then((data: any) => {
            this.isLoadingPop = false;
            if (data == 200 || data.id > 0) {
                this.getAllEntries();
                jQuery("#myModal").modal('hide');

                if (this.MediServiceRequestmodel.approveType == 'Completed') {
                    // var medcode = this.MediServiceRequestList.find(x => x.requestNo == this.MediServiceRequestmodel.requestNo).finalDocNo;
                    this.errMsgPop1 = "Medical code generated successfully.!";
                }
                else {
                    this.errMsgPop1 = status == "Rejected" ? "Request " + this.MediServiceRequestmodel.requestNo + " Rejected Successfully!" : "Request " + this.MediServiceRequestmodel.requestNo + " Approved Successfully!";
                }

                jQuery("#saveModal").modal('show');

                // this.Inserttransactions(this.MediServiceRequestmodel, status, Number.parseInt(this.currentStage) + 1);
                this.resetForm();
                // if (status != "Rejected") {
                //   this.sendRejectMail(this.MediServiceRequestmodel);
                // }
                // else {
                //   if(this.MediServiceRequestmodel.stage !='5')
                //   {
                //     this.sendMailtoApprover(this.MediServiceRequestmodel);
                //   }
                // }
            }

            this.isApproveLoading = false;
        }).catch(error => {
            this.isLoadingPop = false;
            this.isApproveLoading = false;
            this.errMsgPop = status == "Rejected" ? "Error Rejecting Request: "+ this.MediServiceRequestmodel.requestNo : "Error Approving Request: "+ this.MediServiceRequestmodel.requestNo;
            console.log(error);
        });
    }

    getRole(value) {
        if (value == '1' || value == '4') {
            this.Role = 'MED_HEAD';
        }
        else if (value == '2') {
            this.Role = 'REVIEWER';
        }
        else if (value == '0' || value == '3') {
            this.Role = 'HOD';
        }
        return this.Role;
    }

    onRevertRequest(status) {
        this.errMsg = "";
        let connection: any;
        this.currentStage = this.MediServiceRequestmodel.stage;
        this.MediServiceRequestmodel.currentStage = Number.parseInt(this.currentStage) + 1;

        if (this.currentStage == '0' || this.currentStage == '3') {
            this.MediServiceRequestmodel.lastApproverRole = 'HOD';
        } else if (this.currentStage == '1' || this.currentStage == '4') {
            this.MediServiceRequestmodel.lastApproverRole = 'MED_HEAD';
        } else if (this.currentStage == '2') {
            this.MediServiceRequestmodel.lastApproverRole = 'REVIEWER';
        }

        if (status == this.msService.revertedToInitiatorText) {
            this.MediServiceRequestmodel.pendingApprover = "No";
            this.Role = this.getRole(this.MediServiceRequestmodel.stage);
            this.MediServiceRequestmodel.stage = '0';
            // this.MediServiceRequestmodel.revertVersion == null ? this.MediServiceRequestmodel.revertVersion = 1 : this.MediServiceRequestmodel.revertVersion = this.MediServiceRequestmodel.revertVersion + 1;
            this.MediServiceRequestmodel.revertVersion = this.MediServiceRequestmodel.revertVersion == null ? 1 : this.MediServiceRequestmodel.revertVersion + 1;

            if (this.MediServiceRequestmodel.inputType == "scientific") {
                this.MediServiceRequestmodel.reviewerAssignFlag = 0;
            }
        } else {
            //this.MediServiceRequestmodel.revertVersion==null ?this.MediServiceRequestmodel.revertVersion=1:this.MediServiceRequestmodel.revertVersion+1;
            // this.MediServiceRequestmodel.pendingApprover = this.transactionslist.find(x => x.approvalPriority.toString() == this.MediServiceRequestmodel.stage).doneBy;

            if (this.MediServiceRequestmodel.stage == '4' && this.MediServiceRequestmodel.inputType != 'scientific') {
                let pendingApproverTransactions = this.transactionslist.filter(x => x.role == "HOD");
                this.MediServiceRequestmodel.pendingApprover = pendingApproverTransactions[pendingApproverTransactions.length - 1].doneBy;
            } else {
                let pendingApproverTransactions = this.transactionslist.filter(x => x.approvalPriority.toString() == this.MediServiceRequestmodel.stage);
                this.MediServiceRequestmodel.pendingApprover = pendingApproverTransactions[pendingApproverTransactions.length - 1].doneBy;
            }

            if (this.MediServiceRequestmodel.stage == '1') {
                this.MediServiceRequestmodel.stage = '0';
                this.MediServiceRequestmodel.reviewerAssignFlag = 0;
            } else if (this.MediServiceRequestmodel.stage == '2') {
                this.MediServiceRequestmodel.stage = '1';
                this.MediServiceRequestmodel.reviewerAssignFlag = 0;
            } else if (this.MediServiceRequestmodel.stage == '3') {
                this.MediServiceRequestmodel.stage = '2';
            } else if (this.MediServiceRequestmodel.stage == '4' && this.MediServiceRequestmodel.inputType == 'scientific') {
                this.MediServiceRequestmodel.stage = '3';
            } else if (this.MediServiceRequestmodel.stage == '4' && this.MediServiceRequestmodel.inputType != 'scientific') {
                this.MediServiceRequestmodel.stage = '0';
            } else if (this.MediServiceRequestmodel.stage == '5') {
                this.MediServiceRequestmodel.stage = '4';
            }
        }

        this.MediServiceRequestmodel.approveType = "In Process";
        this.MediServiceRequestmodel.lastApprover = this.currentUser.fullName;
        this.MediServiceRequestmodel.modifiedBy = this.currentUser.employeeId;
        this.MediServiceRequestmodel.approverId = this.currentUser.employeeId;
        this.MediServiceRequestmodel.status = status;
        this.MediServiceRequestmodel.comments = this.Comments;

        connection = this.httpService.put(APIURLS.BR_MED_SERVICE_REQUEST_INSERT_API, this.MediServiceRequestmodel.id, this.MediServiceRequestmodel);
        connection.then((data: any) => {
            this.isLoadingPop = false;
            if (data == 200 || data.id > 0) {
                jQuery("#myModal").modal('hide');
                this.errMsgPop1 = "Request " + this.MediServiceRequestmodel.requestNo + " Reverted Successfully!";
                jQuery("#saveModal").modal('show');

                // this.sendMail(this.MediServiceRequestmodel);
                var Astatus = status == this.msService.revertedToInitiatorText ? 'Reverted to Initiator' : 'Reverted to last approver';
                // if(status == this.msService.revertedToInitiatorText)
                // {
                //   this.MediServiceRequestmodel.stage=stage1;
                // }

                if (this.currentUser.employeeId == this.ApprovingManager.employeeId) {
                    this.MediServiceRequestmodel.stage = '1';
                }

                // this.Inserttransactions(this.MediServiceRequestmodel, Astatus, Number.parseInt(this.currentStage) + 1);
                this.getAllEntries();
                this.resetForm();
                //  this.sendRevertMail(this.MediServiceRequestmodel);
            }
        }).catch(error => {
            console.log(error);
            this.isLoadingPop = false;
            this.errMsgPop = "Error Reverting Request " + this.MediServiceRequestmodel.requestNo;
        });
    }

    Inserttransactions(data, status, approvalPriority) {
        this.errMsg = "";
        let connection: any;
        let transaction = {} as MediServiceRequestHistory;

        transaction.doneBy = this.currentUser.employeeId;
        transaction.requestNo = data.requestNo;
        transaction.comments = this.Comments;
        transaction.approvalPriority = approvalPriority;
        transaction.revertVersion = data.revertVersion;
        // if(data.stage=='0')
        // {
        //   this.transactions.role=this.Role;
        // }
        if (data.stage == '5') {
            transaction.transactionType = "Completed";
        } else {
            transaction.transactionType = status;
        }

        if (status == "Reverted to Initiator" || status == "Reverted to last approver") {
            if (this.currentStage == '0' || this.currentStage == '3') {
                transaction.role = 'HOD';
            } else if (this.currentStage == '1' || this.currentStage == '4') {
                transaction.role = 'MED_HEAD';
            } else if (this.currentStage == '2') {
                transaction.role = 'REVIEWER';
            }

            if (this.currentStage != null) {
                transaction.approvalPriority = Number.parseInt(this.currentStage) + 1;
            }
        } else {
            if (data.stage == '1' || data.stage == '4') {
                transaction.role = 'HOD';
            } else if (data.stage == '2' || data.stage == '5') {
                transaction.role = 'MED_HEAD';
            } else if (data.stage == '3' || data.stage == '0') {
                transaction.role = 'REVIEWER';
            }
        }

        if (status == 'Submitted') {
            transaction.role = 'INITIATOR';
        }

        transaction.approverName = this.currentUser.fullName;
        transaction.department = this.currentUser.department;
        transaction.designation = this.currentUser.designation;
        transaction.processType = "MedInput request";

        connection = this.httpService.post(APIURLS.BR_MED_SERVICE_HISTORY_INSERT_API, transaction);
    }

    onReviewerChange() {
        console.log(this.Reviewer);
    }

    MassApprove(status) {
        this.isLoadingReq = true;
        this.isLoading = true;
        this.isApproveLoading = true;

        if (this.Approves == "Assign" && !this.Reviewer && status != "Rejected") {
            swal("Message", "Please select a reviewer before approving requests.", "warning");
            this.isLoadingReq = false;
            this.isLoading = false;
            this.isApproveLoading = false;

            return;
        }

        this.checkedRequestList.forEach(element => {
            element.fullName = this.currentUser.fullName;
            element.comments = status;

            if (element.stage == '0') {
                if (status == "Mass Approved" && element.inputType != 'scientific') {
                    // To Medical Head
                    element.stage = '4';
                    element.reviewerAssignFlag = 1;
                    element.pendingApprover = this.MedHeadID;
                    element.penApproverId = this.MedHeadID;
                    element.approveType = "In Process";
                } else {
                    // To Medical Head
                    element.reviewerAssignFlag = 0;
                    if (status == "Mass Approved" && element.inputType == 'scientific') {
                        element.stage = '1';
                        element.pendingApprover = this.MedHeadID;
                        element.penApproverId = this.MedHeadID;
                        element.approveType = "In Process";
                    } else {
                        element.stage = '1';
                        element.approveType = 'Rejected';
                        element.pendingApprover = 'No';
                    }
                }
            } else if (element.stage == '1') {
                if (status == "Mass Approved") {
                    // To Medical Advisor
                    element.stage = '2';
                    element.reviewerAssignFlag = 1;
                    element.pendingApprover = "97907";
                    element.approveType = "In Process";

                    if (this.Reviewer != null || this.Reviewer != undefined) {
                        element.penApproverId = this.Reviewer;
                        element.pendingApprover = this.Reviewer;
                    }
                } else {
                    element.stage = '2';
                    element.approveType = 'Rejected';
                    element.pendingApprover = 'No';
                }
            } else if (element.stage == '3') {
                if (status == "Mass Approved") {
                    // To Medical Head
                    element.stage = '4';
                    element.penApproverId = this.MedHeadID;
                    element.pendingApprover = this.MedHeadID;
                    element.approveType = "In Process";
                } else {
                    element.stage = '4';
                    element.approveType = 'Rejected';
                    element.pendingApprover = 'No';
                }
            } else if (element.stage == '4') {
                if (status == "Mass Approved") {
                    // Completed
                    element.stage = '5';
                    element.approveType = "Completed";
                    element.pendingApprover = "No";
                } else {
                    element.stage = '5';
                    element.approveType = 'Rejected';
                    element.pendingApprover = 'No';
                }
            }

            element.department = this.currentUser.department;
            element.designation = this.currentUser.designation;
            element.lastApprover = this.currentUser.fullName;
            element.modifiedBy = this.currentUser.employeeId;
            element.approverId = this.currentUser.employeeId;
        });

        let connection = this.httpService.post(APIURLS.BR_MED_SERVICE_REQUEST_MASSAPPROVE_API, this.checkedRequestList);
        connection.then((data: any) => {
            this.isLoadingPop = true;
            this.isLoadingReq = true;
            this.checkedRequestList = [];

            if (data) {
                this.getAllEntries();
                this.isMasterSel = false;
                this.Reviewer = null;
                this.checkUncheckAll();

                if (status == 'Mass Approved') {
                    this.errMsgPop1 = " Requests Approved Successfully!";
                }
                else {
                    this.errMsgPop1 = " Requests Rejected Successfully!";
                }

                jQuery("#saveModal").modal('show');
            } else {
                swal({
                    title: "Message",
                    text: "Error Creating Code",
                    icon: "warning",
                    dangerMode: false,
                    buttons: [false, true]
                });
                
                this.getAllEntries();
            }

            this.isLoadingPop = false;
            this.isLoadingReq = false;
            this.isLoading = false;
            this.isApproveLoading = false;
        }).catch(error => {
            this.errMsgPop = "Error while mass approving requests. Please check the console for error details.";
            console.log(error);
            this.isLoadingPop = false;
            this.isLoadingReq = false;
            this.isLoading = false;
            this.isApproveLoading = false;
        });
    }

    // sendPendingMail(MediServiceRequest: MediServiceRequest) {
    //   let connection: any;

    //   connection = this.httpService.sendPutMail(APIURLS.BR_SEND_VENDOR_MASTER_PENDING_EMAIL_API, 'VendorPending', MediServiceRequest);
    //   connection.then((data: any) => {
    //     if (data == 200) {
    //     }
    //   }).catch(error => {
    //     this.errMsgPop = 'Error in sending mail..';
    //   });

    // }

    downloadFile(reqNo, value) {
        if (value.length > 0) {
            this.httpService.getFile(APIURLS.BR_MED_FILEDOWNLOAD_API, reqNo, value).then((data: any) => {
                if (data != undefined) {
                    var FileSaver = require('file-saver');
                    const imageFile = new File([data], value);
                    FileSaver.saveAs(imageFile);
                }
            }).catch(error => {
                this.isLoading = false;
                console.log(error);
            });
        } else {
            swal({
                title: "Message",
                text: "No File on server",
                icon: "warning",
                dangerMode: false,
                buttons: [false, true]
            }).then((willDelete) => {
                if (willDelete) {
                    this.isLoading = false;
                }
            });
        }
    }

    deletefile(item, name) {
        //let attach:any='';
        if (this.attachments.length > 0) {
            const index = this.attachments.indexOf(name);
            this.attachments.splice(index, 1);
        }
        let attach: any = this.attachments[0];
        for (let i = 1; i < this.attachments.length; i++) {
            attach = this.attachments[i] + ',' + attach;
        }
        item.attachements = attach;
        this.MediServiceRequestmodel.attachements = attach;
        let connection = this.httpService.put(APIURLS.BR_MED_SERVICE_REQUEST_INSERT_API, item.id, item);
        connection.then((data: any) => {
            this.isLoadingPop = false;
            if (data == 200 || data.id > 0) {
                swal({
                    title: "Message",
                    text: "File Deleted Successfully",
                    icon: "success",
                    dangerMode: false,
                    buttons: [false, true]
                })
            }
        }).catch(error => {
            this.isLoadingPop = false;
            this.errMsgPop = 'Error deleting file. Check the console for error details.';
            console.log(error);
        });
    }

    removefile(name) {
        const index = this.fileNamesList.indexOf(name);
        this.fileNamesList.splice(index, 1);

        var index1 = this.files.indexOf(name)
        let removedFile: File[] = this.files.splice(index1, 1);

        this.totalFileSize -= removedFile[0].size;
        this.totalFileSizeInMB = this.totalFileSize / 1000000;
        this.fileSizePercentage = (this.totalFileSize / this.msService.maxFileSize) * 100;

        if (this.fileNamesList.length == 0) {
            this.errMsg1 = '';
            this.files = [];
        }
    }

    print(): void {
        // this.printElement(document.getElementById("print-section"));
        let printContents, popupWin;
        printContents = document.getElementById('print-section').innerHTML;
        popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
        popupWin.document.open();
        popupWin.document.write(`
          <html>
            <head>
              <title>Item Code Request Form</title>
             <link rel="stylesheet" type="text/css" href="assets/custom/print.css" />
              <link rel="stylesheet" type="text/css" href="assets/bootstrap/css/bootstrap.min.css" />
            </head>
            <body onload="window.print();window.close()">
            <table class="report-container">
              <thead class="report-header">
              <tr>
              <td class="report-header-cell">
                <div class="header-info">
                  Print Date: ${new Date().toLocaleDateString('en-GB')}  Printed By: ${this.currentUser.fullName}
                </div>
              </td>
            </tr>
              </thead>
              <tbody class="report-content">
                <tr>
                  <td class="report-content-cell">
                    <div class="main">
                    ${printContents}
                    </div>
                  </td>
                </tr>
              </tbody>

            </table>
            </body>
          </html>`
        );
        popupWin.document.close();
    }

    checkUncheckAll() {
        for (var i = 0; i < this.MediServiceRequestList.length; i++) {
            this.MediServiceRequestList[i].isSelected = this.isMasterSel;
        }
        this.getCheckedItemList();
    }

    isAllSelected() {
        this.isMasterSel = this.MediServiceRequestList.every(function (item: any) {
            return item.isSelected == true;
        })
        this.getCheckedItemList();
    }

    getCheckedItemList() {
        this.checkedRequestList = [];
        this.checkedlist = [];
        for (var i = 0; i < this.MediServiceRequestList.length; i++) {
            if (this.MediServiceRequestList[i].isSelected)
                this.checkedlist.push(this.MediServiceRequestList[i]);
        }
        this.checkedRequestList = this.checkedlist;
    }

    ShowHistory(data) {
        this.transactionslist1 = [];
        this.MediServiceRequestmodel1 = data;
        this.httpService.getByParam(APIURLS.BR_MED_SERVICE_HISTORY_API, this.MediServiceRequestmodel1.requestNo).then((data: any) => {
            this.isLoading = true;
            if (data.length > 0) {
                data.filter(x => x.processType == 'MedInput request');
                this.transactionslist1 = data.sort((a, b) => {
                    if (a.doneOn > b.doneOn) return 1;
                    if (a.doneOn < b.doneOn) return -1;
                    return 0;
                })
                //this.transactionslist.reverse();
            }
            //this.reInitDatatable();
            this.isLoadingPop = false;
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.transactionslist1 = [];
        });



        jQuery("#HistoryModal").modal('show');
    }

    sendMail(MediServiceRequest: MediServiceRequest) {
        let connection: any;

        connection = this.httpService.post(APIURLS.BR_MED_SERVICE_REQUEST_SENDMAIL_API, MediServiceRequest);
        connection.then((data: any) => {
            if (data == 200) {
            }
        }).catch(error => {
            this.errMsgPop = 'Error sending email. Please check the console for error details';
            console.log(error);
        });

    }

    sendMailtoApprover(MediServiceRequest: MediServiceRequest) {
        let connection: any;

        connection = this.httpService.post(APIURLS.BR_MED_SERVICE_APPROVER_SENDMAIL_API, MediServiceRequest);
        connection.then((data: any) => {
            if (data == 200) {

            }
        }).catch(error => {
            this.errMsgPop = "Error occurred while sending mail. Please check the console for error details.";
            console.log(error);
        });
    }

    sendRevertMail(MediServiceRequest: MediServiceRequest) {
        let connection: any;

        connection = this.httpService.post(APIURLS.BR_MED_SERVICE_REVERT_SENDMAIL_API, MediServiceRequest);
        connection.then((data: any) => {
            if (data == 200) {
            }
        }).catch(error => {
            this.errMsgPop = 'Error in sending mail..';
        });

    }

    sendRejectMail(MediServiceRequest: MediServiceRequest) {
        let connection: any;

        connection = this.httpService.post(APIURLS.BR_MED_SERVICE_REJECT_SENDMAIL_API, MediServiceRequest);
        connection.then((data: any) => {
            if (data == 200) {
            }
        }).catch(error => {
            this.errMsgPop = 'Error in sending mail..';
        });

    }

    GetMediServiceMasterDump() {
        this.isLoading = true;
        let td = new Date();
        let formatedFROMdate: string;
        let formatedTOdate: string;
        var filterModel: any = {};
        // if (this.from_date == '' || this.from_date == null) {
        //   formatedFROMdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" + "01";
        //   this.from_date = new Date(td.getFullYear(), td.getMonth(), 1);
        // }
        // else {
        //   let fd = new Date(this.from_date);
        //   formatedFROMdate = fd.getFullYear() + "-" + ("00" + (fd.getMonth() + 1)).slice(-2) + "-" +
        //     ("00" + fd.getDate()).slice(-2);
        //   this.from_date = new Date(fd.getFullYear(), fd.getMonth(), fd.getDate());

        // }

        // if (this.to_date == '' || this.to_date == null) {
        //   formatedTOdate = td.getFullYear() + "-" + ("00" + (td.getMonth() + 1)).slice(-2) + "-" +
        //     ("00" + td.getDate()).slice(-2);
        //   this.to_date = new Date(td.getFullYear(), td.getMonth(), +("00" + td.getDate()).slice(-2), 23, 59);
        // }
        // else {
        //   let ed = new Date(this.to_date);
        //   formatedTOdate = ed.getFullYear() + "-" + ("00" + (ed.getMonth() + 1)).slice(-2) + "-" +
        //     ("00" + ed.getDate()).slice(-2);
        //   this.to_date = new Date(ed.getFullYear(), ed.getMonth(), +("00" + ed.getDate()).slice(-2), 23, 59);

        // }


        filterModel.FromDate = this.getFormatedDateTime(this.from_date1);
        filterModel.ToDate = this.getFormatedDateTime(this.msService.to_date);
        this.httpService.post(APIURLS.BR_MED_SERVICE_MASTER_DUMP_API, filterModel).then((dump: any) => {
            if (dump.length > 0) {
                this.MasterDumpData = dump;
                //this.exportAsXLSX(this.MasterDumpData);
            }
            else {
                swal({
                    title: "Message",
                    text: "No data found..!",
                    icon: "warning",
                    dangerMode: false,
                    buttons: [false, true]
                });
            }
            this.isLoading = false;
        }).catch(error => {
            this.isLoading = false;
            this.MasterDumpData = [];
            console.log(error);
        });
    }

    exportAsXLSX() {

        //Excel Title, Header, Data
        const title = 'Medi Service Report';
        const header = ["Input No", "Division", "Product", "Type of Input", "Input Received from PMT", "Input Reverted V1",
            "Input Received V2", "Input Reverted V2", "Input Received V3", "Input Reverted V3", "Final Medical Code generated", "Final medical code"]

        var exportList = [];
        var ts: any = {};
        let index = 0;
        this.MasterDumpData.forEach(element => {
            index = index + 1;
            ts = {};
            ts.input_No = (element.input_No),
                ts.division = element.division,
                ts.product = element.product,
                ts.type_of_Input = element.type_of_Input,
                ts.input_Received_from_PMT = element.input_Received_from_PMT;
            ts.input_Reverted_V1 = element.input_Reverted_V1;
            ts.input_Received_V2 = element.input_Received_V2;
            ts.input_Reverted_V2 = element.input_Reverted_V2;
            ts.input_Received_V3 = element.input_Received_V3;
            ts.input_Reverted_V3 = element.input_Reverted_V3;
            ts.final_Medical_Code_generated = element.final_Medical_Code_generated;

            // ts.input_Received_from_PMT=this.datePipe.transform(element.input_Received_from_PMT,'dd/MM/yyyy HH:mm a');
            // ts.input_Reverted_V1=this.datePipe.transform(element.input_Reverted_V1,'dd/MM/yyyy HH:mm a');
            // ts.input_Received_V2=this.datePipe.transform(element.input_Received_V2,'dd/MM/yyyy HH:mm a');
            // ts.input_Reverted_V2=this.datePipe.transform(element.input_Reverted_V2,'dd/MM/yyyy HH:mm a');
            // ts.input_Received_V3=this.datePipe.transform(element.input_Received_V3,'dd/MM/yyyy HH:mm a');
            // ts.input_Reverted_V3=this.datePipe.transform(element.input_Reverted_V3,'dd/MM/yyyy HH:mm a');
            // ts.final_Medical_Code_generated=this.datePipe.transform(element.final_Medical_Code_generated,'dd/MM/yyyy HH:mm a');

            ts.final_medical_code = element.final_medical_code;

            exportList.push(ts);

        });
        //var OrganisationName ="MICRO LABS LIMITED"+', '+this.locationname;
        const data = exportList;
        //Create workbook and worksheet
        let workbook: ExcelProper.Workbook = new ExcelJS.Workbook();
        let worksheet = workbook.addWorksheet('Medi service Report');

        //Add Header Row
        let headerRow = worksheet.addRow(header);

        // Cell Style : Fill and Border
        headerRow.eachCell((cell, number) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF00' },
                bgColor: { argb: 'FF0000FF' }
            }
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        })
        //  worksheet.addRows(data);
        // Add Data and Conditional Formatting
        //data.forEach()

        for (let x1 of data) {
            let x2 = Object.keys(x1);
            let temp = []
            for (let y of x2) {
                temp.push(x1[y])
            }
            worksheet.addRow(temp)
        }

        worksheet.eachRow((cell, number) => {
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        })
        worksheet.getColumn(1).width = 15;
        worksheet.getColumn(2).width = 15;
        worksheet.getColumn(3).width = 30;
        worksheet.getColumn(4).width = 40;
        worksheet.getColumn(5).width = 30;
        worksheet.getColumn(6).width = 30;
        worksheet.getColumn(7).width = 30;
        worksheet.getColumn(8).width = 30;
        worksheet.getColumn(9).width = 30;
        worksheet.getColumn(10).width = 30;
        worksheet.getColumn(11).width = 30;
        worksheet.getColumn(12).width = 20;
        worksheet.addRow([]);


        workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, 'MediServiceReport.xlsx');
        })

    }
}