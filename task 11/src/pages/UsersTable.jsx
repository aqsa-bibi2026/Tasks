import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

function UsersTable() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("app_users")
        .select("*");

      console.log("Users Data:", data);
      console.log("Users Error:", error);

      if (error) {
        console.error(error);
      } else {
        setUsers(data || []);
      }

      setLoading(false);
    };

    fetchUsers();
  }, []);


  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Users Management
      </h1>


      {loading ? (

        <div className="text-center text-lg">
          Loading Users...
        </div>

      ) : (


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


        {/* Users Table */}

        <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden">

          <table className="w-full">

            <thead className="bg-gray-100">

              <tr>

                <th className="p-4 text-left">
                  ID
                </th>

                <th className="p-4 text-left">
                  Name
                </th>

                <th className="p-4 text-left">
                  Email
                </th>

              </tr>

            </thead>


            <tbody>


              {users.length > 0 ? (

                users.map((user)=>(

                  <tr
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="border-b hover:bg-blue-50 cursor-pointer transition"
                  >

                    <td className="p-4">
                      {user.id}
                    </td>


                    <td className="p-4 font-semibold">
                      {user.name}
                    </td>


                    <td className="p-4">
                      {user.email}
                    </td>


                  </tr>

                ))


              ) : (

                <tr>

                  <td 
                    colSpan="3"
                    className="p-6 text-center text-gray-500"
                  >
                    No Users Found
                  </td>

                </tr>

              )}


            </tbody>


          </table>


        </div>



        {/* User Details */}

        <div className="bg-white rounded-xl shadow-md p-6">


          {selectedUser ? (

            <div>

              <h2 className="text-xl font-bold mb-5">
                User Details
              </h2>


              <div className="space-y-4">

                <p>
                  <span className="font-bold">
                    ID:
                  </span>
                  <br/>
                  {selectedUser.id}
                </p>


                <p>
                  <span className="font-bold">
                    Name:
                  </span>
                  <br/>
                  {selectedUser.name}
                </p>


                <p>
                  <span className="font-bold">
                    Email:
                  </span>
                  <br/>
                  {selectedUser.email}
                </p>


              </div>

            </div>


          ) : (

            <div className="text-gray-500 text-center mt-10">
              Select a user to view details
            </div>

          )}


        </div>


      </div>

      )}

    </div>
  );
}

export default UsersTable;