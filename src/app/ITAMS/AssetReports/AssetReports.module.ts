import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssetReportsComponent } from './AssetReports.component';
import { AssetReportsRoutingModule } from './AssetReports-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        AssetReportsRoutingModule
    ],
    declarations: [AssetReportsComponent],
    providers: [DatePipe]
})
export class AssetReportsModule { }
