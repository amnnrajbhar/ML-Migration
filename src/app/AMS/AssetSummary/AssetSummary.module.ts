import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssetSummaryComponent } from './AssetSummary.component';
import { AssetSummaryRoutingModule } from './AssetSummary-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        AssetSummaryRoutingModule
    ],
    declarations: [
        AssetSummaryComponent
    ]
})
export class AssetSummaryModule { }
