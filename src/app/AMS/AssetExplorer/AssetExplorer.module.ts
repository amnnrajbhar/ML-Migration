import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssetExplorerComponent } from './AssetExplorer.component';
import { AssetExplorerRoutingModule } from './AssetExplorer-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        AssetExplorerRoutingModule,
    ],

    declarations: [
        AssetExplorerComponent
    ]
})
export class AssetExplorerModule { }
