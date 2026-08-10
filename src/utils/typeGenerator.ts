// Utility to generate TypeScript Interfaces, Python Pydantic Models, and Python Dataclass from JSON objects

export function generateTypeScriptTypes(json: any, rootName: string = "ApiResponse"): string {
  if (json === null || json === undefined) return "// Veri bulunamadı";

  const lines: string[] = [];
  const interfaces: Map<string, string> = new Map();

  function capitalize(str: string) {
    if (!str) return "Item";
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/[^a-zA-Z0-9]/g, "");
  }

  function getType(val: any, parentKey: string): string {
    if (val === null) return "any";
    if (Array.isArray(val)) {
      if (val.length === 0) return "any[]";
      const itemType = getType(val[0], parentKey + "Item");
      return `${itemType}[]`;
    }
    if (typeof val === "object") {
      const interfaceName = capitalize(parentKey);
      generateInterface(val, interfaceName);
      return interfaceName;
    }
    return typeof val;
  }

  function generateInterface(obj: Record<string, any>, name: string) {
    if (interfaces.has(name)) return;

    let code = `export interface ${name} {\n`;
    for (const [key, value] of Object.entries(obj)) {
      const validKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
      const propType = getType(value, key);
      code += `  ${validKey}: ${propType};\n`;
    }
    code += `}`;

    interfaces.set(name, code);
  }

  if (Array.isArray(json)) {
    if (json.length === 0) return `export type ${rootName} = any[];`;
    const itemType = getType(json[0], rootName + "Item");
    const subInterfaces = Array.from(interfaces.values()).join("\n\n");
    return `${subInterfaces}\n\nexport type ${rootName} = ${itemType}[];`;
  } else if (typeof json === "object") {
    generateInterface(json, rootName);
    return Array.from(interfaces.values()).join("\n\n");
  } else {
    return `export type ${rootName} = ${typeof json};`;
  }
}

export function generatePydanticModel(json: any, rootName: string = "ApiResponse"): string {
  if (json === null || json === undefined) return "# Veri bulunamadı";

  const models: Map<string, string> = new Map();

  function capitalize(str: string) {
    if (!str) return "Item";
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/[^a-zA-Z0-9]/g, "");
  }

  function getPythonType(val: any, parentKey: string): string {
    if (val === null) return "Optional[Any] = None";
    if (Array.isArray(val)) {
      if (val.length === 0) return "List[Any] = []";
      const itemType = getPythonType(val[0], parentKey + "Item").split(" = ")[0];
      return `List[${itemType}]`;
    }
    if (typeof val === "object") {
      const modelName = capitalize(parentKey);
      generateModel(val, modelName);
      return modelName;
    }
    if (typeof val === "string") return "str";
    if (typeof val === "number") return Number.isInteger(val) ? "int" : "float";
    if (typeof val === "boolean") return "bool";
    return "Any";
  }

  function generateModel(obj: Record<string, any>, name: string) {
    if (models.has(name)) return;

    let code = `class ${name}(BaseModel):\n`;
    const keys = Object.keys(obj);
    if (keys.length === 0) {
      code += "    pass";
    } else {
      for (const [key, value] of Object.entries(obj)) {
        const pyType = getPythonType(value, key);
        code += `    ${key}: ${pyType}\n`;
      }
    }

    models.set(name, code);
  }

  if (Array.isArray(json)) {
    if (json.length === 0) return `from pydantic import BaseModel\nfrom typing import List, Any\n\n# Array of objects`;
    const itemType = getPythonType(json[0], rootName + "Item").split(" = ")[0];
    const subModels = Array.from(models.values()).join("\n\n");
    return `from pydantic import BaseModel\nfrom typing import List, Optional, Any\n\n${subModels}\n\n# Root Collection\nRootModel = List[${itemType}]`;
  } else if (typeof json === "object") {
    generateModel(json, rootName);
    return `from pydantic import BaseModel\nfrom typing import List, Optional, Any\n\n${Array.from(models.values()).join("\n\n")}`;
  } else {
    return `# Primitive type: ${typeof json}`;
  }
}

export function generatePythonDataclass(json: any, rootName: string = "ApiResponse"): string {
  if (json === null || json === undefined) return "# Veri bulunamadı";

  const classes: Map<string, string> = new Map();

  function capitalize(str: string) {
    if (!str) return "Item";
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/[^a-zA-Z0-9]/g, "");
  }

  function getPythonType(val: any, parentKey: string): string {
    if (val === null) return "Optional[Any] = None";
    if (Array.isArray(val)) {
      if (val.length === 0) return "List[Any]";
      const itemType = getPythonType(val[0], parentKey + "Item").split(" = ")[0];
      return `List[${itemType}]`;
    }
    if (typeof val === "object") {
      const className = capitalize(parentKey);
      generateClass(val, className);
      return className;
    }
    if (typeof val === "string") return "str";
    if (typeof val === "number") return Number.isInteger(val) ? "int" : "float";
    if (typeof val === "boolean") return "bool";
    return "Any";
  }

  function generateClass(obj: Record<string, any>, name: string) {
    if (classes.has(name)) return;

    let code = `@dataclass\nclass ${name}:\n`;
    const keys = Object.keys(obj);
    if (keys.length === 0) {
      code += "    pass";
    } else {
      for (const [key, value] of Object.entries(obj)) {
        const pyType = getPythonType(value, key);
        code += `    ${key}: ${pyType}\n`;
      }
    }

    classes.set(name, code);
  }

  if (typeof json === "object" && !Array.isArray(json)) {
    generateClass(json, rootName);
    return `from dataclasses import dataclass\nfrom typing import List, Optional, Any\n\n${Array.from(classes.values()).join("\n\n")}`;
  }
  return generatePydanticModel(json, rootName);
}
