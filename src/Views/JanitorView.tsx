import * as React from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useCallback, useState } from "react";
import { OperationType } from "src/JanitorSettings";

export interface SelectableItem {
	selected: boolean,
	name: string
}
export interface JanitorViewProps {
	scanning: boolean,
	orphans: SelectableItem[] | false,
	empty: SelectableItem[] | false,
	big: SelectableItem[] | false,
	expired: SelectableItem[] | false,
	onClose: ()=>void,
	onSelectionChange: (i:number,section:string)=>void,
	onPerform(operation:string):void,
	// useSystemTrash: boolean,
	onSettingChange:(setting:string, value:any)=>void
}

export const JanitorView = (props: JanitorViewProps) => {

	// const [state, setState] = useState({
	// 	scanning: true,
	// 	orphans: 0
	// });
	const { scanning, onClose, onPerform } = props;
	const somethingSelected = [props.orphans, props.empty, props.expired, props.big]
	.some(files => files && files.some(item=>item.selected))
	


	const handlePerform = useCallback((operation:OperationType)=>useCallback(()=>{
		onPerform(operation);
	},[operation,onPerform]),[onPerform]);
	// const handleTrash = handlePerform(OperationType.Trash);
	// const handleTrashSystem = handlePerform(OperationType.TrashSystem);
	// const handleDelete = handlePerform(OperationType.Delete);
	// caches the handler for each operation type to avoid React
	// complaining of different hooks calls depending on which
	// buttons we are rendering
	const handles:{[op:string]:()=>void} = Object.values(OperationType).reduce((ob, opType)=>{
		return {...ob, [opType]: handlePerform(opType)}
	},{});

	// const handleTrashChange = useCallback(()=>{
	// 	onSettingChange("useSystemTrash", !useSystemTrash);
	// },[onSettingChange,useSystemTrash]);

	return (
		<div className="janitor-modal-wrapper">
			<div className="janitor-modal-title">Janitor Scan Results</div>
			<div className="janitor-modal-content">
				{scanning ? <h4>Scanning...</h4> : <ScanResults {...props} />}
			</div>
			<div className="janitor-modal-footer">
				{/* <div className="janitor-footer-settings">
					<label htmlFor="useSystemTrash">Use System Trash</label>
					<input name="useSystemTrash" id="useSystemTrash" type="checkbox" checked={useSystemTrash} onChange={handleTrashChange} />
				</div> */}
				<div className="janitor-footer-buttons">
					<button tabIndex={1} style={{visibility: somethingSelected ? 'visible' : 'hidden' }} className="" onClick={handles[OperationType.Trash]} title="Put files in the Obsidian .trash" >Trash (Obsidian)</button>
					<button tabIndex={1} style={{visibility: somethingSelected ? 'visible' : 'hidden' }} className="" onClick={handles[OperationType.TrashSystem]} title="Put files in the OS' trash">Trash (System)</button>
					<button tabIndex={1} style={{visibility: somethingSelected ? 'visible' : 'hidden' }} className="" onClick={handles[OperationType.Delete]} title="Permanently delete files">Delete</button>
					<button tabIndex={1} className="mod-cta" onClick={onClose}>Cancel</button>
				</div>	
			</div>
		</div>
	)
};
function ScanResults({ orphans,empty,big,expired, onSelectionChange }: 
	{ orphans: SelectableItem[] | false, 
		empty: SelectableItem[] | false,
		big: SelectableItem[] | false,
		expired: SelectableItem[] | false,
		onSelectionChange:(i:number,section:string)=>void }) {
	
	const handleSelectionChange =
		useCallback((section:string)=>
			useCallback((i:number)=>{
				onSelectionChange(i,section);
			},[onSelectionChange,section])	
		,[onSelectionChange ])

	;


	return (
		<div className="janitor-scan-results">
			{/* <fieldset> */}
			{orphans && <FileList files={orphans} onChange={handleSelectionChange("orphans")} title="Orphans" />}
			{empty && <FileList title="Empty" files={empty} onChange={handleSelectionChange("empty")} />}
			{expired && <FileList title="Expired" files={expired} onChange={handleSelectionChange("expired")} />}
			{big && <FileList title="Big" files={big} onChange={handleSelectionChange("big")} />}
			{/* </fieldset> */}
		</div>

	)

}

const FileList = ({files, onChange, title}:{files:SelectableItem[], 
	onChange:(i:number)=>void,
	title: string}
	) => {

	const handleOnChange = useCallback((i:number)=>
		useCallback(
			()=>{
				onChange(i);
			}
		,[onChange,i])
	,[onChange]);

	
	const allSelected = files.every(file => file.selected);

	return (<div className="janitor-files-wrapper">
		<div className="janitor-scan-section-title">
			<label title={`Click to ${allSelected?"unselect":"select"} these ${files.length} items`}>
			<input type="checkbox" checked={allSelected} onChange={handleOnChange(-1)} />
			{title} ({files.length} items) 
			</label>
		</div>
			
		{
			files.map((file,i)=>(
				<div key={i} className="janitor-file">
					<label>
					<input 
						checked={file.selected}
						value={file.name} 
						onChange={handleOnChange(i)}
						type="checkbox" />
					<span>{file.name}</span>
					</label>
				</div>
			))
		}
	</div>
	);
}