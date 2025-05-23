import { ExcelService } from './shared/excel-service';
import { HttpService } from './shared/http-service';
import { AuthGuard } from './auth/auth-guard.service';
import { AppRoutingModule } from './app-routing.module';


import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './auth/auth.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { SearchPipe } from './shared/search-pipe';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { InitPageComponent } from './initiallogin/initpage.component';
import { AppService } from './shared/app.service';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { SchedulerModule } from 'angular-calendar-scheduler';
import { CalendarModule, DateAdapter } from 'angular-calendar';
// import { MatProgressSpinnerModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule, MatRadioModule, MatTooltipModule, MatSelectModule } from '@angular/material';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';

// camera
import { WebcamModule } from 'ngx-webcam';
import { CameraComponent } from './camera/camera.component';
import { OpencameraComponent } from './opencamera/opencamera.component';
import { LightboxModule } from 'ngx-lightbox';
import { PageboardComponent } from './pageboard/pageboard.component';
import { SafePipe } from './shared/safe.pipe';
// import {
//   OwlDateTimeModule,
//   OwlNativeDateTimeModule,
//   OWL_DATE_TIME_FORMATS
// } from 'ng-pick-datetime';
import { HttpClientModule } from '@angular/common/http';

import { ESSModule } from './HR/ESS/ess.module';
import { EmployeeModule } from './HR/Employee/employee.module';
import { EditContractEmployeeComponent } from './EditContractEmployee/EditContractEmployee.component';
import { ViewContractEmployeeComponent } from './ViewContractEmployee/ViewContractEmployee.component';
import { OffersModule } from './HR/Offer/offers.module';
import { ActionsModule } from './HR/actions/actions.module';
import { AppointmentModule } from './HR/appointment/appointment.module';
import { ChecklistModule } from './HR/checklist/checklist.module';
import { ConfigModule } from './HR/config/config.module';
import { ConfirmationModule } from './HR/confirmation/confirmation.module';
import { FnFModule } from './HR/fnf/fnf.module';
import { RecallModule } from './HR/recall/recall.module';
import { RetirementModule } from './HR/retirement/retirement.module';
import { SeparationModule } from './HR/separation/separation.module';
import { HRSharedModule } from './HR/shared/hr-shared.module';
import { TerminationModule } from './HR/termination/termination.module';
import { DefineBudgetCreateComponent } from './HR/manpower/define-budget-create/define-budget-create.component';
import { DefineBudgetEditComponent } from './HR/manpower/define-budget-edit/define-budget-edit.component';
import { DefineBudgetListComponent } from './HR/manpower/define-budget-list/define-budget-list.component';
import { JdtemplateCreateComponent } from './HR/manpower/jdtemplate-create/jdtemplate-create.component';
import { JdtemplateEditComponent } from './HR/manpower/jdtemplate-edit/jdtemplate-edit.component';
import { JdtemplateListComponent } from './HR/manpower/jdtemplate-list/jdtemplate-list.component';
// import { OwlMomentDateTimeModule } from 'ng-pick-datetime-moment';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

import { PPCMasterComponent } from './HR/PPCMaster/PPCMaster.component';
import { AllowanceMappingComponent } from './HR/AllowanceMapping/AllowanceMapping.component';
import { HomepageComponent } from './homepage/homepage.component';

// Format custom
export const MY_MOMENT_FORMATS = {
  parseInput: 'DD/MM/YYYY LT',
  fullPickerInput: 'DD/MM/YYYY LT',
  datePickerInput: 'DD/MM/YYYY',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SearchPipe,
    InitPageComponent,
    CameraComponent,
    OpencameraComponent,
    PageboardComponent,
    SafePipe,
    EditContractEmployeeComponent,
    ViewContractEmployeeComponent,
    JdtemplateListComponent,
    JdtemplateCreateComponent,
    JdtemplateEditComponent,
    DefineBudgetListComponent,
    DefineBudgetCreateComponent,
    DefineBudgetEditComponent,
    HomepageComponent,
    // PPCMasterComponent,
    // AllowanceMappingComponent,


  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,

    // OffersModule,
    // AppointmentModule,
    // ChecklistModule,
    // ESSModule,
    // EmployeeModule,
    // SeparationModule,
    // ConfirmationModule,
    // ActionsModule,

    HRSharedModule,

    // RecallModule,
    // TerminationModule,
    // RetirementModule,
    // ConfigModule,
    // FnFModule,

    FormsModule,
    HttpClientModule,
    AppRoutingModule,


    LightboxModule,
    ReactiveFormsModule,
    WebcamModule,
    MatSelectModule,

    //ramesh Changes
    MatInputModule,
    MatFormFieldModule,
    // MatProgressSpinnerModule,
    MatAutocompleteModule,
    WebcamModule,
    MatRadioModule,
    MatTooltipModule,
    //AngularMultiSelectModule,
    // OwlDateTimeModule,
    // OwlNativeDateTimeModule,
    // OwlMomentDateTimeModule,
    NgMultiSelectDropDownModule.forRoot(),


    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    SchedulerModule.forRoot({ locale: 'en', headerDateFormat: 'daysRange' }),

  ],
  providers: [AuthService, AuthGuard, HttpService, ExcelService, AppService,
    { provide: LOCALE_ID, useValue: 'en-US' },
    // { provide: OWL_DATE_TIME_FORMATS, useValue: MY_MOMENT_FORMATS }
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
