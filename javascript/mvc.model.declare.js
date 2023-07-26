// mvc.parameter.declare.js

inlets = 1;
outlets = 2;

_MVC_VERSION = 0.4;

var modelDict = new Dict();
modelDict.quiet = 1;
modelDict.name = "mvc.models.dict";
	
var inputsDict = new Dict();
inputsDict.quiet = 1;
inputsDict.name = "mvc.inputs.dict";

var parametersValuesDict = new Dict();
parametersValuesDict.quiet = 1;
parametersValuesDict.name = "mvc.parameters.values.dict";

var attrDict = new Dict();

var statesValuesDict = new Dict();
statesValuesDict.quiet = 1;
statesValuesDict.name = "mvc.states.values.dict";

var model_UID = 0;

var parentAddresses = [];
var previousAddresses = [];
var expandedNames = [];
var newAddresses = [];
var modelAddressDict = new Dict();
modelAddressDict.name = "modelAddressDict";
modelAddressDict.quiet = 1;
// var parentUID;

function updateDictionaries(){
	
	// model_UID is the 1st arg, followed by addresses 
	var _args = arrayfromargs(arguments);
	model_UID = _args[0];
	post("model_UID", model_UID, "\n");
	post("--args", _args, "\n");
	expandedNames = _args;
	expandedNames.shift();
	post("expandedNames", expandedNames, "\n");

	attrDict.name = model_UID + ".attr";
	
	var parent_model_UID = attrDict.get("parent");
	post("parent_model_UID", parent_model_UID, "\n");


	// if no expanded names is provided, remove this model
	if (expandedNames.length == 0) {
		modelAddressDict.remove(model_UID.toString());
	}
	else { // else we need to concatenate with parent model
		// special case : this is the top level model
		if (parent_model_UID == model_UID){ 
				newAddresses = [];
				newAddresses.push(model_UID);
				post("top level model", newAddresses, "\n");
		}
		// fetch parent addresses for this model UID
		else {
			var parentAddressesTest = modelAddressDict.get(parent_model_UID);
			if (parentAddressesTest != null) {
				if (Array.isArray(parentAddressesTest)) {
					parentAddresses = parentAddressesTest;
					post("parentAddresses is an array \n");
				}
				else {
					parentAddresses = [];
					parentAddresses.push(parentAddressesTest);
					post("previous address is a solo \n");
				}
			}
			else {
				parentAddresses = [];
			}	
			// concatenate paths for this model
			newAddresses = [];
			for (var i = 0; i < (parentAddresses.length); i++) {
				var concatAddress = parentAddresses[i] + "/" + expandedNames[(i%(parentAddresses.length))];
				post("---concatAddress", concatAddress, "\n");
				newAddresses.push(concatAddress);
			}
		}
	} 

	post("parentAddresses", parentAddresses, "\n");
	post("newAddresses", newAddresses, "\n");

	// fetch previous addresses for this model UID
	var test = modelAddressDict.get(model_UID);
	if (test != null) {
		if (Array.isArray(test)) {
			previousAddresses = test;
			post("previous address is an array:", previousAddresses, "\n");
		}
		else {
			previousAddresses = [];
			previousAddresses.push(test);
			post("previous address is a solo", previousAddresses, "\n");
		}
	}
	else {
		previousAddresses = [];
		post("previous address did not exist", previousAddresses, "\n");
	}	

	// compare new addresses with previous addresses for this node
	var missingAdresses = findGoneItems(newAddresses, previousAddresses);

	// remove gone addresses only for values
	for (var i = 0; i < (missingAdresses.length); i++) {
		var theAdd = missingAdresses[i].replace(/\//g, '::');
		//post('removing', theAdd, '\n')
		parametersValuesDict.remove(theAdd);
		statesValuesDict.remove(theAdd);
		inputsDict.remove(theAdd);
		//outlet(1, model_UID.toString(), 0); // no need to uninitialize as they will be remove
	}

	// remove all previous addresses in parameters (to rebuild all indices)
	for (var i = 0; i < (previousAddresses.length); i++) {
		var theAdd = previousAddresses[i].replace(/\//g, '::');
		// parametersDict.remove(theAdd);
		//inputsDict.remove(theAdd);
		modelDict.remove(theAdd);
		//post("removing param:", theAdd, "\n");
		//outlet(1, missingAdresses[i], 0);
		//outlet(1, model_UID.toString(), 0);
	}
	// add new addresses in model dict
	for (var i = 0; i < (newAddresses.length); i++) {
		var theAdd = newAddresses[i].replace(/\//g, '::');
    	//post('add', i, model_UID, theAdd, "\n");
    var addressUID = [model_UID, i + 1];
		// parametersDict.replace(theAdd + "::uid", addressUID);
		modelDict.replace(theAdd + "::uid", addressUID);
	}
	
	modelAddressDict.set(model_UID, newAddresses);

}

function declare(){
	//just pass arguments to updateDictionaries
	// (see https://stackoverflow.com/questions/3914557/passing-arguments-forward-to-another-javascript-function)
	//post("model args in declare", JSON.stringify(arguments), "\n");
//
	//model_UID = arguments[0];
	//post("model_UID", model_UID, "\n");
//
	//var _a_args = arrayfromargs(arguments);
	//_a_args.shift();
	//post("_a_args", JSON.stringify(_a_args), "\n");

	//updateDictionaries(_a_args);

	updateDictionaries.apply(null, arguments);
	
	var initState = arrayfromargs(arguments).length;
	
	// *First*, send initializers to private (param and states)
	outlet(1, model_UID.toString()+".i", initState>0);

	// *Then*, send initializers to public (remotes)
	for (var i = 0; i < (newAddresses.length); i++) {
		outlet(1, newAddresses[i], 1);	
	}
	
	// bang when done
	var sendAddress = model_UID + ".model.declare.done";
	outlet(0, "send", sendAddress);
	outlet(0, initState>0);
}


function findGoneItems(CurrentArray, PreviousArray) {
	
    var CurrentArrSize = CurrentArray.length;
    var PreviousArrSize = PreviousArray.length;
    var missingItems = [];
    // loop through previous array
    for(var j = 0; j < PreviousArrSize; j++) {
      // look for same thing in new array
      if (CurrentArray.indexOf(PreviousArray[j]) == -1)
         missingItems.push(PreviousArray[j]);
   }
   return missingItems;
}

function loadbang(	) {
	//outlet(3, 'bang');
}

function empty(){
	updateDictionaries();
}

function clear(){
	previousAddresses = [];
}


// function setParamDict(paramDict){
// 	paramAttrDict.name = paramDict;
// 	var parentModelType = modelDict
// }


// function setParentUID(uid){
// 		parentUID = uid;
// }

