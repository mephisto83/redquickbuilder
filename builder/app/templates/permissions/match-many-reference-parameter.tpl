
            var {{variable}}_connections = await arbiter{{relationship}}.GetBy({{relationship}}Get.Get{{relationship}}(data, value));
            var {{variable}}_connection = {{variable}}_connections.FirstOrDefault();
            var mustExist_{{variable}} = {{variable}}_connection != null;
            var mustBe_{{variable}} = mustExist_{{variable}} && {{variable}}_connection.{{property}} == false;
            var {{variable}} = {{variable}}_connections.Count == 1 && mustExist_{{variable}} && mustBe_{{variable}};