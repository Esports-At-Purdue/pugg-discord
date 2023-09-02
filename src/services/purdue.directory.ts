import axios from "axios";
import parse from "node-html-parser";

export class PurdueDirectory {
    public static async getNameFromAddress(address: string) {
        const formData = new FormData();
        formData.append("searchString", address);
        const options = { data: formData };
        const response = await axios.get("https://www.purdue.edu/directory/", options);
        const root = parse(response.data);
        return root.querySelector(".cn_name")?.text?.split(" ");
    }
}