import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DisposeAssetComponent } from './DisposeAsset.component';
import { DisposeAssetRoutingModule } from './DisposeAsset-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        MatCheckboxModule,
        DisposeAssetRoutingModule
    ],
    declarations: [
        DisposeAssetComponent
    ]
})
export class DisposeAssetModule { }
